import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { CrmObject } from '@crm/@lib/@types';
import { Utils } from '@crm/@lib/@utils';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IContactService } from '../types';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private webhook: WebhookService,
    private serviceRegistry: ServiceRegistry,
    private utils: Utils,
    private coreUnification: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(ContactService.name);
  }

  async addContact(
    unifiedContactData: UnifiedCrmContactInput,
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmContactOutput> {
    try {
      const linkedUser = await this.validateLinkedUser(linkedUserId);

      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.contact',
        );

      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedCrmContactInput>({
          sourceObject: unifiedContactData,
          targetType: CrmObject.contact,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: unifiedContactData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified object is ' + JSON.stringify(desunifiedObject),
      );

      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalContactOutput> = await service.addContact(
        desunifiedObject,
        linkedUserId,
      );

      const unifiedObject = (await this.coreUnification.unify<
        OriginalContactOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.contact,
        providerName: integrationId,
        vertical: 'crm',
        connectionId: connection_id,
        customFieldMappings: customFieldMappings,
      })) as UnifiedCrmContactOutput[];

      const source_contact = resp.data;
      const target_contact = unifiedObject[0];

      const unique_crm_contact_id = await this.saveOrUpdateContact(
        target_contact,
        connection_id,
      );

      await this.ingestService.processFieldMappings(
        target_contact.field_mappings,
        unique_crm_contact_id,
        integrationId,
        linkedUserId,
      );

      await this.ingestService.processRemoteData(
        unique_crm_contact_id,
        source_contact,
      );

      const result_contact = await this.getContact(
        unique_crm_contact_id,
        undefined,
        undefined,
        connection_id,
        project_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.contact.created', // sync, push or pull
          method: 'POST',
          url: '/crm/contacts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.dispatchWebhook(
        result_contact,
        'crm.contact.created',
        linkedUser.id_project,
        event.id_event,
      );

      return result_contact;
    } catch (error) {
      throw error;
    }
  }

  async validateLinkedUser(linkedUserId: string) {
    const linkedUser = await this.prisma.linked_users.findUnique({
      where: { id_linked_user: linkedUserId },
    });
    if (!linkedUser) throw new ReferenceError('Linked User Not Found');
    return linkedUser;
  }

  async saveOrUpdateContact(
    contact: UnifiedCrmContactOutput,
    connection_id: string,
  ): Promise<string> {
    const existingContact = await this.prisma.crm_contacts.findFirst({
      where: { remote_id: contact.remote_id, id_connection: connection_id },
      include: {
        crm_email_addresses: true,
        crm_phone_numbers: true,
        crm_addresses: true,
      },
    });

    const { normalizedEmails, normalizedPhones } =
      this.utils.normalizeEmailsAndNumbers(
        contact.email_addresses,
        contact.phone_numbers,
      );

    const normalizedAddresses = this.utils.normalizeAddresses(
      contact.addresses,
    );
    const data: any = {
      first_name: contact.first_name,
      last_name: contact.last_name,
      id_crm_user: contact.user_id,
      modified_at: new Date(),
    };

    if (existingContact) {
      const res = await this.prisma.crm_contacts.update({
        where: { id_crm_contact: existingContact.id_crm_contact },
        data: data,
      });

      await this.updateRelatedEntities(
        normalizedEmails,
        normalizedPhones,
        normalizedAddresses,
        existingContact.id_crm_contact,
        connection_id,
        existingContact,
      );

      return res.id_crm_contact;
    } else {
      data.created_at = new Date();
      data.remote_id = contact.remote_id;
      data.id_connection = connection_id;
      data.id_crm_contact = uuidv4();

      const newContact = await this.prisma.crm_contacts.create({ data: data });

      await this.createRelatedEntities(
        normalizedEmails,
        normalizedPhones,
        normalizedAddresses,
        newContact.id_crm_contact,
        connection_id,
      );

      return newContact.id_crm_contact;
    }
  }

  async updateRelatedEntities(
    normalizedEmails: any[],
    normalizedPhones: any[],
    normalizedAddresses: any[],
    contactId: string,
    connectionId: string,
    existingContact: any,
  ) {
    if (normalizedEmails && normalizedEmails.length > 0) {
      await Promise.all(
        normalizedEmails.map((email, index) => {
          if (existingContact.crm_email_addresses[index]) {
            return this.prisma.crm_email_addresses.update({
              where: {
                id_crm_email:
                  existingContact.crm_email_addresses[index].id_crm_email,
              },
              data: email,
            });
          } else {
            return this.prisma.crm_email_addresses.create({
              data: {
                ...email,
                id_crm_contact: contactId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }

    if (normalizedPhones && normalizedPhones.length > 0) {
      await Promise.all(
        normalizedPhones.map((phone, index) => {
          if (existingContact.crm_phone_numbers[index]) {
            return this.prisma.crm_phone_numbers.update({
              where: {
                id_crm_phone_number:
                  existingContact.crm_phone_numbers[index].id_crm_phone_number,
              },
              data: phone,
            });
          } else {
            return this.prisma.crm_phone_numbers.create({
              data: {
                ...phone,
                id_crm_contact: contactId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }

    if (normalizedAddresses && normalizedAddresses.length > 0) {
      await Promise.all(
        normalizedAddresses.map((addy, index) => {
          if (existingContact.crm_addresses[index]) {
            return this.prisma.crm_addresses.update({
              where: {
                id_crm_address:
                  existingContact.crm_addresses[index].id_crm_address,
              },
              data: addy,
            });
          } else {
            return this.prisma.crm_addresses.create({
              data: {
                ...addy,
                id_crm_contact: contactId,
                id_connection: connectionId,
              },
            });
          }
        }),
      );
    }
  }

  async createRelatedEntities(
    normalizedEmails: any[],
    normalizedPhones: any[],
    normalizedAddresses: any[],
    contactId: string,
    connectionId: string,
  ) {
    if (normalizedEmails && normalizedEmails.length > 0) {
      await Promise.all(
        normalizedEmails.map((email) =>
          this.prisma.crm_email_addresses.create({
            data: {
              ...email,
              id_crm_contact: contactId,
              id_connection: connectionId,
            },
          }),
        ),
      );
    }

    if (normalizedPhones && normalizedPhones.length > 0) {
      await Promise.all(
        normalizedPhones.map((phone) =>
          this.prisma.crm_phone_numbers.create({
            data: {
              ...phone,
              id_crm_contact: contactId,
              id_connection: connectionId,
            },
          }),
        ),
      );
    }

    if (normalizedAddresses && normalizedAddresses.length > 0) {
      await Promise.all(
        normalizedAddresses.map((addy) =>
          this.prisma.crm_addresses.create({
            data: {
              ...addy,
              id_crm_contact: contactId,
              id_connection: connectionId,
            },
          }),
        ),
      );
    }
  }

  async getContact(
    id_crm_contact: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedCrmContactOutput> {
    try {
      const contact = await this.prisma.crm_contacts.findUnique({
        where: {
          id_crm_contact: id_crm_contact,
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
          crm_addresses: true,
        },
      });

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

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedCrmContactInput format
      const unifiedContact: UnifiedCrmContactOutput = {
        id: contact.id_crm_contact,
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
        addresses: contact.crm_addresses.map((addy) => ({
          ...addy,
        })),
        user_id: contact.id_crm_user,
        field_mappings: field_mappings,
        remote_id: contact.remote_id,
        created_at: contact.created_at,
        modified_at: contact.modified_at,
      };

      let res: UnifiedCrmContactOutput = unifiedContact;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: contact.id_crm_contact,
          },
        });
        const remote_data = JSON.parse(resp.data);

        if (resp && resp.data) {
          res = {
            ...res,
            remote_data: remote_data,
          };
        }
      }
      if (linkedUserId && integrationId) {
        await this.prisma.events.create({
          data: {
            id_connection: connectionId,
            id_project: projectId,
            id_event: uuidv4(),
            status: 'success',
            type: 'crm.contact.pull',
            method: 'GET',
            url: '/crm/contact',
            provider: integrationId,
            direction: '0',
            timestamp: new Date(),
            id_linked_user: linkedUserId,
          },
        });
      }
      return res;
    } catch (error) {
      throw error;
    }
  }

  async getContacts(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedCrmContactOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.crm_contacts.findFirst({
          where: {
            id_connection: connection_id,
            id_crm_contact: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const contacts = await this.prisma.crm_contacts.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_crm_contact: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
          crm_addresses: true,
        },
      });

      if (contacts.length === limit + 1) {
        next_cursor = Buffer.from(
          contacts[contacts.length - 1].id_crm_contact,
        ).toString('base64');
        contacts.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedContacts: UnifiedCrmContactOutput[] = await Promise.all(
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
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          // Convert the map to an object
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedCrmContactInput format
          return {
            id: contact.id_crm_contact,
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
            addresses: contact.crm_addresses.map((addy) => ({
              ...addy,
            })),
            user_id: contact.id_crm_user,
            field_mappings: field_mappings,
            remote_id: contact.remote_id,
            created_at: contact.created_at,
            modified_at: contact.modified_at,
          };
        }),
      );

      let res: UnifiedCrmContactOutput[] = unifiedContacts;

      if (remote_data) {
        const remote_array_data: UnifiedCrmContactOutput[] = await Promise.all(
          res.map(async (contact) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: contact.id,
              },
            });
            if (resp && resp.data) {
              const remote_data = JSON.parse(resp.data);
              return { ...contact, remote_data };
            }
            return contact;
          }),
        );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'crm.contact.pull',
          method: 'GET',
          url: '/crm/contacts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
