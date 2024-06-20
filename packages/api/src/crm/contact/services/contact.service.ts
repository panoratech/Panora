import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { IContactService } from '../types';
import { CrmObject } from '@crm/@lib/@types';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { ApiResponse } from '@@core/utils/types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { ServiceRegistry } from './registry.service';
import { Utils } from '@crm/@lib/@utils';
import { throwTypedError, UnifiedCrmError } from '@@core/utils/errors';
import { CoreUnification } from '@@core/utils/services/core.service';

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
  ) {
    this.logger.setContext(ContactService.name);
  }

  async batchAddContacts(
    unifiedContactData: UnifiedContactInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedContactData.map((unifiedData) =>
          this.addContact(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throw error;
    }
  }

  async addContact(
    unifiedContactData: UnifiedContactInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'crm.contact',
        );
      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedContactInput>({
          sourceObject: unifiedContactData,
          targetType: CrmObject.contact,
          providerName: integrationId,
          vertical: 'crm',
          customFieldMappings: unifiedContactData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'desunified obect is ' + JSON.stringify(desunifiedObject),
      );

      const service: IContactService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalContactOutput> = await service.addContact(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalContactOutput[]
      >({
        sourceObject: [resp.data],
        targetType: CrmObject.contact,
        providerName: integrationId,
        vertical: 'crm',
        customFieldMappings: customFieldMappings,
      })) as UnifiedContactOutput[];

      // add the contact inside our db
      const source_contact = resp.data;
      const target_contact = unifiedObject[0];

      const existingContact = await this.prisma.crm_contacts.findFirst({
        where: {
          remote_id: target_contact.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
        include: {
          crm_email_addresses: true,
          crm_phone_numbers: true,
          crm_addresses: true,
        },
      });

      const { normalizedEmails, normalizedPhones } =
        this.utils.normalizeEmailsAndNumbers(
          target_contact.email_addresses,
          target_contact.phone_numbers,
        );

      const normalizedAddresses = this.utils.normalizeAddresses(
        target_contact.addresses,
      );

      let unique_crm_contact_id: string;

      if (existingContact) {
        // Update the existing contact
        let data: any = {
          first_name: '',
          last_name: '',
          modified_at: new Date(),
        };
        if (target_contact.first_name) {
          data = { ...data, first_name: target_contact.first_name };
        }
        if (target_contact.last_name) {
          data = { ...data, last_name: target_contact.last_name };
        }
        if (target_contact.user_id) {
          data = {
            ...data,
            id_crm_user: target_contact.user_id,
          };
        }

        const res = await this.prisma.crm_contacts.update({
          where: {
            id_crm_contact: existingContact.id_crm_contact,
          },
          data: data,
        });
        if (normalizedEmails && normalizedEmails.length > 0) {
          await Promise.all(
            normalizedEmails.map((email, index) => {
              if (
                existingContact &&
                existingContact.crm_email_addresses[index]
              ) {
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
                    id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                  },
                });
              }
            }),
          );
        }
        if (normalizedPhones && normalizedPhones.length > 0) {
          await Promise.all(
            normalizedPhones.map((phone, index) => {
              if (existingContact && existingContact.crm_phone_numbers[index]) {
                return this.prisma.crm_phone_numbers.update({
                  where: {
                    id_crm_phone_number:
                      existingContact.crm_phone_numbers[index]
                        .id_crm_phone_number,
                  },
                  data: phone,
                });
              } else {
                return this.prisma.crm_phone_numbers.create({
                  data: {
                    ...phone,
                    id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                  },
                });
              }
            }),
          );
        }

        if (normalizedAddresses && normalizedAddresses.length > 0) {
          await Promise.all(
            normalizedAddresses.map((addy, index) => {
              if (existingContact && existingContact.crm_addresses[index]) {
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
                    id_crm_contact: existingContact.id_crm_contact, // Assuming 'uuid' is the ID of the related contact
                  },
                });
              }
            }),
          );
        }

        unique_crm_contact_id = res.id_crm_contact;
      } else {
        // Create a new contact
        this.logger.log('not existing contact ' + target_contact.first_name);
        let data: any = {
          id_crm_contact: uuidv4(),
          first_name: '',
          last_name: '',
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_contact.remote_id,
          remote_platform: integrationId,
        };

        if (target_contact.first_name) {
          data = { ...data, first_name: target_contact.first_name };
        }
        if (target_contact.last_name) {
          data = { ...data, last_name: target_contact.last_name };
        }
        if (target_contact.user_id) {
          data = {
            ...data,
            id_crm_user: target_contact.user_id,
          };
        }

        const newContact = await this.prisma.crm_contacts.create({
          data: data,
        });

        if (normalizedEmails && normalizedEmails.length > 0) {
          await Promise.all(
            normalizedEmails.map((email) =>
              this.prisma.crm_email_addresses.create({
                data: {
                  ...email,
                  id_crm_contact: newContact.id_crm_contact,
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
                  id_crm_contact: newContact.id_crm_contact,
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
                  id_crm_contact: newContact.id_crm_contact,
                },
              }),
            ),
          );
        }

        unique_crm_contact_id = newContact.id_crm_contact;
      }

      // check duplicate or existing values
      if (
        target_contact.field_mappings &&
        target_contact.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_crm_contact_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_contact.field_mappings,
        )) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: slug,
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: value || 'null',
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
          data: JSON.stringify(source_contact),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_contact),
          created_at: new Date(),
        },
      });

      const result_contact = await this.getContact(
        unique_crm_contact_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'crm.contact.created', //sync, push or pull
          method: 'POST',
          url: '/crm/contacts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
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

  async getContact(
    id_crm_contact: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
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
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedContactInput format
      const unifiedContact: UnifiedContactOutput = {
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
      };

      let res: UnifiedContactOutput = unifiedContact;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: contact.id_crm_contact,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getContacts(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedContactOutput[];
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
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
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
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
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
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );

          // Transform to UnifiedContactInput format
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
          };
        }),
      );

      let res: UnifiedContactOutput[] = unifiedContacts;

      if (remote_data) {
        const remote_array_data: UnifiedContactOutput[] = await Promise.all(
          res.map(async (contact) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: contact.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...contact, remote_data };
          }),
        );

        res = remote_array_data;
      }
      const event = await this.prisma.events.create({
        data: {
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
  //TODO
  async updateContact(
    id: string,
    updateContactData: Partial<UnifiedContactInput>,
  ): Promise<UnifiedContactOutput> {
    try {
    } catch (error) {}
    // TODO: fetch the contact from the database using 'id'
    // TODO: update the contact with 'updateContactData'
    // TODO: save the updated contact back to the database
    // TODO: return the updated contact
    return;
  }
}
