import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { ApiResponse, ContactResponse, Email, Phone } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import {
  CrmObject,
  FreshsalesContactInput,
  HubspotContactInput,
  PipedriveContactInput,
  ZendeskContactInput,
  ZohoContactInput,
} from 'src/crm/@types';
import { LoggerService } from '@@core/logger/logger.service';
import { unify } from '@@core/utils/unification/unify';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@contact/types/model.unified';
import { OriginalContactOutput } from '@@core/utils/types';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { decrypt } from '@@core/utils/crypto';
import axios from 'axios';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

@Injectable()
export class ContactService {
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
    this.logger.setContext(ContactService.name);
  }

  /* utils functions */
  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    const normalizedEmails = email_addresses.map((email) => ({
      ...email,
      owner_type: email.owner_type ? email.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_email: uuidv4(), // This line is changed
      email_address_type:
        email.email_address_type === '' ? 'work' : email.email_address_type,
    }));

    const normalizedPhones = phone_numbers.map((phone) => ({
      ...phone,
      owner_type: phone.owner_type ? phone.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_phone_number: uuidv4(), // This line is changed
      phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
    }));

    return {
      normalizedEmails,
      normalizedPhones,
    };
  }

  async batchAddContacts(
    unifiedContactData: UnifiedContactInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    const responses = await Promise.all(
      unifiedContactData.map((unifiedData) =>
        this.addContact(unifiedData, integrationId, linkedUserId, remote_data),
      ),
    );

    const allContacts = responses.flatMap((response) => response.data.contacts);
    const allRemoteData = responses.flatMap(
      (response) => response.data.remote_data || [],
    );

    return {
      data: {
        contacts: allContacts,
        remote_data: allRemoteData,
      },
      message: 'All contacts inserted successfully',
      statusCode: 201,
    };
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    const job_resp_create = await this.prisma.events.create({
      data: {
        id_event: uuidv4(), // Generate a new UUID for each job
        status: 'initialized', // Use whatever status is appropriate
        type: 'push',
        direction: '0',
        timestamp: new Date(),
        id_linked_user: linkedUserId,
      },
    });
    const job_id = job_resp_create.id_event;

    // Retrieve custom field mappings
    // get potential fieldMappings and extract the original properties name
    const customFieldMappings =
      await this.fieldMappingService.getCustomFieldMappings(
        integrationId,
        linkedUserId,
        'contact',
      );
    let resp: ApiResponse<OriginalContactOutput>;
    //desunify the data according to the target obj wanted
    const desunifiedObject = await desunify<UnifiedContactInput>({
      sourceObject: unifiedContactData,
      targetType: CrmObject.contact,
      providerName: integrationId,
      customFieldMappings: unifiedContactData.field_mappings
        ? customFieldMappings
        : [],
    });

    switch (integrationId) {
      case 'freshsales':
        resp = await this.freshsales.addContact(
          desunifiedObject as FreshsalesContactInput,
          linkedUserId,
        );
        break;

      case 'zoho':
        resp = await this.zoho.addContact(
          desunifiedObject as ZohoContactInput,
          linkedUserId,
        );
        break;

      case 'zendesk':
        resp = await this.zendesk.addContact(
          desunifiedObject as ZendeskContactInput,
          linkedUserId,
        );
        break;

      case 'hubspot':
        resp = await this.hubspot.addContact(
          desunifiedObject as HubspotContactInput,
          linkedUserId,
        );
        break;

      case 'pipedrive':
        resp = await this.pipedrive.addContact(
          desunifiedObject as PipedriveContactInput,
          linkedUserId,
        );
        break;

      default:
        break;
    }
    //unify the data according to the target obj wanted
    const unifiedObject = (await unify<OriginalContactOutput[]>({
      sourceObject: [resp.data],
      targetType: CrmObject.contact,
      providerName: integrationId,
      customFieldMappings: customFieldMappings,
    })) as UnifiedContactOutput[];

    let res: ContactResponse = {
      contacts: unifiedObject,
    };

    if (remote_data) {
      res = {
        ...res,
        remote_data: [resp.data],
      };
    }
    const status_resp = resp.statusCode === HttpStatus.OK ? 'success' : 'fail';
    const job_resp = await this.prisma.events.update({
      where: {
        id_event: job_id,
      },
      data: {
        status: status_resp,
      },
    });
    return { ...resp, data: res };
  }

  async getContacts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<ContactResponse>> {
    // handle case for remote data too
    //TODO: handle case where data is not there (not synced) or old synced
    const contacts = await this.prisma.crm_contacts.findMany({
      where: {
        origin: integrationId,
        events: {
          id_linked_user: linkedUserId,
        },
      },
      include: {
        crm_email_addresses: true,
        crm_phone_numbers: true,
      },
    });

    const unifiedContacts: UnifiedContactOutput[] = await Promise.all(
      contacts.map(async (contact) => {
        // Fetch field mappings for the contact
        const values = await this.prisma.value.findMany({
          where: {
            entity: {
              ressource_owner_id: contact.id_crm_contact,
            },
          },
          include: {
            attribute: true,
          },
        });
        //console.log(values);

        const field_mappings = values.map((value) => ({
          [value.attribute.slug]: value.data,
        }));

        // Transform to UnifiedContactInput format
        return {
          first_name: contact.first_name,
          last_name: contact.last_name,
          email_addresses: contact.crm_email_addresses.map((email) => ({
            email_address: email.email_address,
            email_address_type: email.email_address_type,
          })),
          phone_numbers: contact.crm_phone_numbers.map((phone) => ({
            phone_number: phone.phone_number,
            phone_type: phone.phone_type,
          })),
          field_mappings: field_mappings,
        };
      }),
    );

    const res: ContactResponse = {
      contacts: unifiedContacts,
    };

    /*if (remote_data) {
      res = {
        ...res,
        remote_data: [resp.data],
      };
    }*/

    return {
      data: res,
      statusCode: 200,
    };
  }

  //function used by sync worker which populate our crm_contacts table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  //TODO: find a way to save all remote data for each contact somowhere in our db so our GET action know where to fetch it
  async syncContacts(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ) {
    const job_resp_create = await this.prisma.events.create({
      data: {
        id_event: uuidv4(), // Generate a new UUID for each job
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
    return 200;
  }

  async saveContactsInDb(
    linkedUserId: string,
    contacts: UnifiedContactOutput[],
    originIds: string[],
    originSource: string,
    jobId: string,
  ) {
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const originId = originIds[i]; //TODO: check that originId is defined

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
        this.normalizeEmailsAndNumbers(
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
  }

  //TODO
  async updateContact(
    id: string,
    updateContactData: Partial<UnifiedContactInput>,
  ): Promise<ApiResponse<ContactResponse>> {
    // TODO: fetch the contact from the database using 'id'
    // TODO: update the contact with 'updateContactData'
    // TODO: save the updated contact back to the database
    // TODO: return the updated contact
    return;
  }
}
