import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { UnifiedTicketingContactOutput } from '../types/model.unified';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ContactService.name);
  }

  async getContact(
    id_ticketing_contact: string,
    linkedUserId: string,
    integrationId: string,
    connection_id: string,
    project_id: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketingContactOutput> {
    try {
      this.logger.log(`Fetching contact with ID: ${id_ticketing_contact}`);

      const contact = await this.prisma.tcg_contacts.findUnique({
        where: {
          id_tcg_contact: id_ticketing_contact,
        },
      });

      if (!contact) {
        this.logger.warn(`Contact with ID ${id_ticketing_contact} not found`);
      }

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: contact.id_tcg_contact,
          },
        },
        include: {
          attribute: true,
        },
      });

      const fieldMappingsMap = new Map();
      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      const field_mappings = Object.fromEntries(fieldMappingsMap);

      const unifiedContact: UnifiedTicketingContactOutput = {
        id: contact.id_tcg_contact,
        email_address: contact.email_address,
        name: contact.name,
        details: contact.details,
        phone_number: contact.phone_number,
        field_mappings: field_mappings,
        remote_id: contact.remote_id,
        created_at: contact.created_at,
        modified_at: contact.modified_at,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: contact.id_tcg_contact,
          },
        });
        const remote_data = JSON.parse(resp.data);
        unifiedContact.remote_data = remote_data;
      }

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.contact.pull',
          method: 'GET',
          url: '/ticketing/contact',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      this.logger.log(`Successfully fetched contact with ID: ${id_ticketing_contact}`);
      return unifiedContact;
    } catch (error) {
      this.logger.error('Error fetching contact:', error);
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
    data: UnifiedTicketingContactOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      this.logger.log(`Fetching contacts for connection ID: ${connection_id} with limit: ${limit}`);

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_contacts.findFirst({
          where: {
            id_connection: connection_id,
            id_tcg_contact: cursor,
          },
        });
        if (!isCursorPresent) {
          this.logger.warn(`The provided cursor ${cursor} does not exist`);
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const contacts = await this.prisma.tcg_contacts.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_contact: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (contacts.length === limit + 1) {
        next_cursor = Buffer.from(contacts[contacts.length - 1].id_tcg_contact).toString('base64');
        contacts.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedContacts: UnifiedTicketingContactOutput[] = await Promise.all(
        contacts.map(async (contact) => {
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: contact.id_tcg_contact,
              },
            },
            include: {
              attribute: true,
            },
          });
          const fieldMappingsMap = new Map();
          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          const field_mappings = Object.fromEntries(fieldMappingsMap);

          return {
            id: contact.id_tcg_contact,
            email_address: contact.email_address,
            name: contact.name,
            details: contact.details,
            phone_number: contact.phone_number,
            field_mappings: field_mappings,
            remote_id: contact.remote_id,
            created_at: contact.created_at,
            modified_at: contact.modified_at,
          };
        }),
      );

      let res: UnifiedTicketingContactOutput[] = unifiedContacts;

      if (remote_data) {
        const remote_array_data: UnifiedTicketingContactOutput[] = await Promise.all(
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

      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.contact.pull',
          method: 'GET',
          url: '/ticketing/contacts',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      this.logger.log(`Successfully fetched ${contacts.length} contacts`);
      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      this.logger.error('Error fetching contacts:', error);
      throw error;
    }
  }
}
