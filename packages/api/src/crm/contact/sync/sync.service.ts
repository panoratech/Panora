import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { ApiResponse, CRM_PROVIDERS } from '@@core/utils/types';
import { unify } from '@@core/utils/unification/unify';
import { WebhookService } from '@@core/webhook/webhook.service';
import { UnifiedContactOutput } from '@crm/contact/types/model.unified';
import { normalizeEmailsAndNumbers } from '@crm/contact/utils';
import { CrmObject } from '@crm/@utils/@types';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { crm_contacts as CrmContact } from '@prisma/client';
import { IContactService } from '../types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { ServiceRegistry } from '../services/registry.service';
import { normalizeAddresses } from '@crm/company/utils';

@Injectable()
export class SyncContactsService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncContactsService.name);
  }

  async onModuleInit() {
    try {
      await this.syncContacts();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  async syncContacts() {
    try {
      this.logger.log(`Syncing contacts....`);
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
      const id_project = defaultProject.id_project;
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: id_project,
        },
      });
      linkedUsers.map(async (linkedUser) => {
        try {
          const providers = CRM_PROVIDERS.filter(
            (provider) => provider !== 'zoho' && provider !== 'freshsales',
          );
          for (const provider of providers) {
            try {
              await this.syncContactsForLinkedUser(
                provider,
                linkedUser.id_linked_user,
                id_project,
              );
            } catch (error) {
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncContactsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} contacts for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping contacts syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
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

      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalContactOutput[]> =
        await service.syncContacts(linkedUserId, remoteProperties);

      const sourceObject: OriginalContactOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalContactOutput[]>({
        sourceObject,
        targetType: CrmObject.contact,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedContactOutput[];

      //TODO
      const contactIds = sourceObject.map((contact) =>
        'id' in contact
          ? String(contact.id)
          : 'contact_id' in contact
          ? String(contact.contact_id)
          : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const contacts_data = await this.saveContactsInDb(
        linkedUserId,
        unifiedObject,
        contactIds,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.contact.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        contacts_data,
        'crm.contact.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveContactsInDb(
    linkedUserId: string,
    contacts: UnifiedContactOutput[],
    originIds: string[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<CrmContact[]> {
    try {
      let contacts_results: CrmContact[] = [];
      for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
        }

        const existingContact = await this.prisma.crm_contacts.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
          include: {
            crm_email_addresses: true,
            crm_phone_numbers: true,
            crm_addresses: true,
          },
        });

        const { normalizedEmails, normalizedPhones } =
          normalizeEmailsAndNumbers(
            contact.email_addresses,
            contact.phone_numbers,
          );

        const normalizedAddresses = normalizeAddresses(contact.addresses);

        let unique_crm_contact_id: string;

        if (existingContact) {
          // Update the existing contact
          let data: any = {
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
            crm_addresses: {
              update: normalizedAddresses.map((addy, index) => ({
                where: {
                  id_crm_address:
                    existingContact.crm_addresses[index].id_crm_address,
                },
                data: addy,
              })),
            },
          };

          if (contact.first_name) {
            data = { ...data, first_name: contact.first_name };
          }
          if (contact.last_name) {
            data = { ...data, last_name: contact.last_name };
          }
          if (contact.user_id) {
            data = {
              ...data,
              id_crm_user: contact.user_id,
            };
          }

          const res = await this.prisma.crm_contacts.update({
            where: {
              id_crm_contact: existingContact.id_crm_contact,
            },
            data: data,
          });

          unique_crm_contact_id = res.id_crm_contact;
          contacts_results = [...contacts_results, res];
        } else {
          // Create a new contact
          this.logger.log('not existing contact ' + contact.first_name);
          const uuid = uuidv4();
          let data: any = {
            id_crm_contact: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (contact.first_name) {
            data = { ...data, first_name: contact.first_name };
          }
          if (contact.last_name) {
            data = { ...data, last_name: contact.last_name };
          }
          if (contact.user_id) {
            data = {
              ...data,
              id_crm_user: contact.user_id,
            };
          }

          if (normalizedEmails) {
            data['crm_email_addresses'] = {
              create: { ...normalizedEmails, id_crm_contact: uuid },
            };
          }

          if (normalizedPhones) {
            data['crm_phone_numbers'] = {
              create: { ...normalizedPhones, id_crm_contact: uuid },
            };
          }
          if (normalizedAddresses) {
            data['crm_addresses'] = {
              create: { ...normalizeAddresses, id_crm_contact: uuid },
            };
          }

          const res = await this.prisma.crm_contacts.create({
            data: data,
          });
          unique_crm_contact_id = res.id_crm_contact;
          contacts_results = [...contacts_results, res];
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

        //insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_crm_contact_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_crm_contact_id,
            format: 'json',
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return contacts_results;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
