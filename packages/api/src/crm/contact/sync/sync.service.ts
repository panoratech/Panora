import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { OriginalContactOutput } from '@@core/utils/types';
import { unify } from '@@core/utils/unification/unify';
import { FreshSalesService } from '@contact/services/freshsales';
import { HubspotService } from '@contact/services/hubspot';
import { PipedriveService } from '@contact/services/pipedrive';
import { ZendeskService } from '@contact/services/zendesk';
import { ZohoService } from '@contact/services/zoho';
import { ApiResponse } from '@contact/types';
import { UnifiedContactOutput } from '@contact/types/model.unified';
import { normalizeEmailsAndNumbers } from '@contact/utils';
import { CrmObject } from '@crm/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SyncContactsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private freshsales: FreshSalesService,
    private hubspot: HubspotService,
    private zoho: ZohoService,
    private zendesk: ZendeskService,
    private pipedrive: PipedriveService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
  ) {
    this.logger.setContext(SyncContactsService.name);
  }

  onModuleInit() {
    this.syncContacts();
  }

  async saveContactsInDb(
    linkedUserId: string,
    contacts: UnifiedContactOutput[],
    originIds: string[],
    originSource: string,
    jobId: string,
  ) {
    try {
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingContact = await this.prisma.crm_contacts.findFirst({
          where: {
            origin_id: originId,
            origin: originSource,
            events: {
              id_linked_user: linkedUserId,
            },
          },
          include: { crm_email_addresses: true, crm_phone_numbers: true },
        });

        const { normalizedEmails, normalizedPhones } =
          normalizeEmailsAndNumbers(
            contact.email_addresses,
            contact.phone_numbers,
          );

        let unique_crm_contact_id: string;

        if (existingContact) {
          // Update the existing contact
          const res = await this.prisma.crm_contacts.update({
            where: {
              id_crm_contact: existingContact.id_crm_contact,
            },
            data: {
              first_name: contact.first_name,
              last_name: contact.last_name,
              modified_at: new Date(),
              crm_email_addresses: {
                update: normalizedEmails.map((email, index) => ({
                  where: {
                    id_crm_email:
                      existingContact.crm_email_addresses[index].id_crm_email,
                  },
                  data: email,
                })),
              },
              crm_phone_numbers: {
                update: normalizedPhones.map((phone, index) => ({
                  where: {
                    id_crm_phone_number:
                      existingContact.crm_phone_numbers[index]
                        .id_crm_phone_number,
                  },
                  data: phone,
                })),
              },
            },
          });
          unique_crm_contact_id = res.id_crm_contact;
        } else {
          // Create a new contact
          this.logger.log('not existing contact ' + contact.first_name);
          const res = await this.prisma.crm_contacts.create({
            data: {
              id_crm_contact: uuidv4(),
              first_name: contact.first_name,
              last_name: contact.last_name,
              created_at: new Date(),
              modified_at: new Date(),
              id_event: jobId,
              origin_id: originId,
              origin: originSource,
              crm_email_addresses: {
                create: normalizedEmails,
              },
              crm_phone_numbers: {
                create: normalizedPhones,
              },
            },
          });
          unique_crm_contact_id = res.id_crm_contact;
        }

        // check duplicate or existing values
        if (contact.field_mappings && contact.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_crm_contact_id,
            },
          });

          for (const mapping of contact.field_mappings) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: Object.keys(mapping)[0],
                source: originSource,
                id_consumer: linkedUserId,
              },
            });

            if (attribute) {
              await this.prisma.value.create({
                data: {
                  id_value: uuidv4(),
                  data: Object.values(mapping)[0]
                    ? Object.values(mapping)[0]
                    : 'null',
                  attribute: {
                    connect: {
                      id_attribute: attribute.id_attribute,
                    },
                  },
                  entity: {
                    connect: {
                      id_entity: entity.id_entity,
                    },
                  },
                },
              });
            }
          }
        }
      }
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/2 * * * *')
  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  //TODO: find a way to save all remote data for each contact somowhere in our db so our GET action know where to fetch it
  async syncContacts() {
    this.logger.log(`Syncing contacts....`);
    //TODO: by default only sync linked_users for the default org for Project 1 for hubspot !
    const defaultOrg = await this.prisma.organizations.findFirst({
      where: {
        name: 'Acme Inc',
      },
    });

    const defaultProject = await this.prisma.projects.findFirst({
      where: {
        id_organization: defaultOrg.id_organization,
        name: 'Project 1',
      },
    });
    const linkedUsers = await this.prisma.linked_users.findMany({
      where: {
        id_project: defaultProject.id_project,
      },
    });
    linkedUsers.map((linkedUser) => {
      this.syncContactsForLinkedUser('hubspot', linkedUser.id_linked_user);
    });
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncContactsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} contacts for linkedUser ${linkedUserId}`,
      );
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized', // Use whatever status is appropriate
          type: 'pull',
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'contact',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      let resp: ApiResponse<OriginalContactOutput[]>;
      switch (integrationId) {
        case 'freshsales':
          resp = await this.freshsales.getContacts(linkedUserId);
          break;

        case 'zoho':
          resp = await this.zoho.getContacts(linkedUserId);
          break;

        case 'zendesk':
          resp = await this.zendesk.getContacts(linkedUserId);
          break;

        case 'hubspot':
          resp = await this.hubspot.getContacts(linkedUserId, remoteProperties);
          break;

        case 'pipedrive':
          resp = await this.pipedrive.getContacts(linkedUserId);
          break;

        default:
          break;
      }

      const sourceObject: OriginalContactOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalContactOutput[]>({
        sourceObject,
        targetType: CrmObject.contact,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedContactOutput[];

      const contactIds = sourceObject.map((contact) =>
        'id' in contact
          ? (contact.id as string)
          : 'contact_id' in contact
          ? String(contact.contact_id)
          : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      await this.saveContactsInDb(
        linkedUserId,
        unifiedObject,
        contactIds,
        integrationId,
        job_id,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
