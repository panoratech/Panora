import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { throwTypedError, UnifiedTicketingError } from '@@core/utils/errors';
import { UnifiedContactOutput } from '../types/model.unified';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ContactService.name);
  }

  async getContact(
    id_ticketing_contact: string,
    remote_data?: boolean,
  ): Promise<UnifiedContactOutput> {
    try {
      const contact = await this.prisma.tcg_contacts.findUnique({
        where: {
          id_tcg_contact: id_ticketing_contact,
        },
      });

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

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));

      // Transform to UnifiedContactOutput format
      const unifiedContact: UnifiedContactOutput = {
        id: contact.id_tcg_contact,
        email_address: contact.email_address,
        name: contact.name,
        details: contact.details,
        phone_number: contact.phone_number,
        field_mappings: field_mappings,
      };

      let res: UnifiedContactOutput = unifiedContact;

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: contact.id_tcg_contact,
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
        const isCursorPresent = await this.prisma.tcg_contacts.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_contact: cursor,
          },
        });
        if (!isCursorPresent) {
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
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      if (contacts.length === limit + 1) {
        next_cursor = Buffer.from(
          contacts[contacts.length - 1].id_tcg_contact,
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
                ressource_owner_id: contact.id_tcg_contact,
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

          // Transform to UnifiedContactOutput format
          return {
            id: contact.id_tcg_contact,
            email_address: contact.email_address,
            name: contact.name,
            details: contact.details,
            phone_number: contact.phone_number,
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
          type: 'ticketing.contact.pull',
          method: 'GET',
          url: '/ticketing/contacts',
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
