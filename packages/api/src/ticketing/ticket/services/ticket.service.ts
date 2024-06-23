import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '../types/model.unified';
import { ITicketService } from '../types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from './registry.service';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
  ) {
    this.logger.setContext(TicketService.name);
  }

  async batchAddTickets(
    unifiedTicketData: UnifiedTicketInput[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketOutput[]> {
    try {
      const responses = await Promise.all(
        unifiedTicketData.map((unifiedData) =>
          this.addTicket(
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

  async addTicket(
    unifiedTicketData: UnifiedTicketInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketOutput> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      //CHECKS
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');
      const acc = unifiedTicketData.account_id;
      //check if contact_id and account_id refer to real uuids
      if (acc) {
        const search = await this.prisma.tcg_accounts.findUnique({
          where: {
            id_tcg_account: acc,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted an account_id which does not exist',
          );
      }

      const contact = unifiedTicketData.contact_id;
      //check if contact_id and account_id refer to real uuids
      if (contact) {
        const search = await this.prisma.tcg_contacts.findUnique({
          where: {
            id_tcg_contact: contact,
          },
        });
        if (!search)
          throw new ReferenceError(
            'You inserted a contact_id which does not exist',
          );
      }
      const assignees = unifiedTicketData.assigned_to;
      //CHEK IF assigned_to contains valid Users uuids
      if (assignees && assignees.length > 0) {
        assignees.map(async (assignee) => {
          const search = await this.prisma.tcg_users.findUnique({
            where: {
              id_tcg_user: assignee,
            },
          });
          if (!search)
            throw new ReferenceError(
              'You inserted an assignee which does not exist',
            );
        });
      }
      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.ticket',
        );
      //desunify the data according to the target obj wanted
      const desunifiedObject =
        await this.coreUnification.desunify<UnifiedTicketInput>({
          sourceObject: unifiedTicketData,
          targetType: TicketingObject.ticket,
          providerName: integrationId,
          vertical: 'ticketing',
          customFieldMappings: unifiedTicketData.field_mappings
            ? customFieldMappings
            : [],
        });

      this.logger.log(
        'ticket desunified is ' + JSON.stringify(desunifiedObject),
      );

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTicketOutput> = await service.addTicket(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalTicketOutput[]
      >({
        sourceObject: [resp.data],
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings: customFieldMappings,
      })) as UnifiedTicketOutput[];

      // add the ticket inside our db
      const source_ticket = resp.data;
      const target_ticket = unifiedObject[0];

      const existingTicket = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: target_ticket.remote_id,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_ticketing_ticket_id: string;

      if (existingTicket) {
        // Update the existing ticket
        let data: any = {
          id_tcg_ticket: uuidv4(),
          modified_at: new Date(),
        };
        if (target_ticket.name) {
          data = { ...data, name: target_ticket.name };
        }
        if (target_ticket.status) {
          data = { ...data, status: target_ticket.status };
        }
        if (target_ticket.description) {
          data = { ...data, description: target_ticket.description };
        }
        if (target_ticket.type) {
          data = { ...data, ticket_type: target_ticket.type };
        }
        if (target_ticket.tags) {
          data = { ...data, tags: target_ticket.tags };
        }
        if (target_ticket.priority) {
          data = { ...data, priority: target_ticket.priority };
        }
        if (target_ticket.completed_at) {
          data = { ...data, completed_at: target_ticket.completed_at };
        }
        if (target_ticket.assigned_to) {
          data = { ...data, assigned_to: target_ticket.assigned_to };
        }
        /*
          parent_ticket: target_ticket.parent_ticket || 'd',
        */
        const res = await this.prisma.tcg_tickets.update({
          where: {
            id_tcg_ticket: existingTicket.id_tcg_ticket,
          },
          data: data,
        });
        unique_ticketing_ticket_id = res.id_tcg_ticket;
      } else {
        // Create a new ticket
        // this.logger.log('not existing ticket ' + target_ticket.name);

        let data: any = {
          id_tcg_ticket: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: target_ticket.remote_id,
          remote_platform: integrationId,
        };
        if (target_ticket.name) {
          data = { ...data, name: target_ticket.name };
        }
        if (target_ticket.status) {
          data = { ...data, status: target_ticket.status };
        }
        if (target_ticket.description) {
          data = { ...data, description: target_ticket.description };
        }
        if (target_ticket.type) {
          data = { ...data, ticket_type: target_ticket.type };
        }
        if (target_ticket.tags) {
          data = { ...data, tags: target_ticket.tags };
        }
        if (target_ticket.priority) {
          data = { ...data, priority: target_ticket.priority };
        }
        if (target_ticket.completed_at) {
          data = { ...data, completed_at: target_ticket.completed_at };
        }
        if (target_ticket.assigned_to) {
          data = { ...data, assigned_to: target_ticket.assigned_to };
        }
        /*
          parent_ticket: target_ticket.parent_ticket || 'd',
        */

        const res = await this.prisma.tcg_tickets.create({
          data: data,
        });
        unique_ticketing_ticket_id = res.id_tcg_ticket;
      }

      // check duplicate or existing values
      if (
        target_ticket.field_mappings &&
        target_ticket.field_mappings.length > 0
      ) {
        const entity = await this.prisma.entity.create({
          data: {
            id_entity: uuidv4(),
            ressource_owner_id: unique_ticketing_ticket_id,
          },
        });

        for (const [slug, value] of Object.entries(
          target_ticket.field_mappings,
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
          ressource_owner_id: unique_ticketing_ticket_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ticketing_ticket_id,
          format: 'json',
          data: JSON.stringify(source_ticket),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_ticket),
          created_at: new Date(),
        },
      });

      const result_ticket = await this.getTicket(
        unique_ticketing_ticket_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.ticket.push', //sync, push or pull
          method: 'PUSH',
          url: '/ticketing/tickets',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_ticket,
        'ticketing.ticket.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_ticket;
    } catch (error) {
      throw error;
      /*throwTypedError(
        new UnifiedTicketingError({
          name: 'CREATE_TICKET_ERROR',
          message: 'TicketService.addTicket() call failed',
          cause: error,
        }),
      );*/
    }
  }

  //TODO: given params return attachments and comments
  async getTicket(
    id_ticketing_ticket: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketOutput> {
    try {
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticketing_ticket,
        },
      });

      // Fetch field mappings for the ticket
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: ticket.id_tcg_ticket,
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

      // Transform to UnifiedTicketOutput format
      const unifiedTicket: UnifiedTicketOutput = {
        id: ticket.id_tcg_ticket,
        name: ticket.name || '',
        status: ticket.status || '',
        description: ticket.description || '',
        due_date: ticket.due_date || null,
        type: ticket.ticket_type || '',
        parent_ticket: ticket.parent_ticket || '',
        tags: ticket.tags || [],
        completed_at: ticket.completed_at || null,
        priority: ticket.priority || '',
        assigned_to: ticket.assigned_to || [],
        field_mappings: field_mappings,
      };

      let res: UnifiedTicketOutput = {
        ...unifiedTicket,
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: ticket.id_tcg_ticket,
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

  async getTickets(
    integrationId: string,
    linkedUserId: string,
    limit: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedTicketOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced

      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.tcg_tickets.findFirst({
          where: {
            remote_platform: integrationId.toLowerCase(),
            id_linked_user: linkedUserId,
            id_tcg_ticket: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const tickets = await this.prisma.tcg_tickets.findMany({
        take: limit + 1,
        cursor: cursor
          ? {
              id_tcg_ticket: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
        /* TODO: only if params 
        include: {
          tcg_comments: true,
        },*/
      });

      if (tickets.length === limit + 1) {
        next_cursor = Buffer.from(
          tickets[tickets.length - 1].id_tcg_ticket,
        ).toString('base64');
        tickets.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedTickets: UnifiedTicketOutput[] = await Promise.all(
        tickets.map(async (ticket) => {
          // Fetch field mappings for the ticket
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: ticket.id_tcg_ticket,
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

          // Transform to UnifiedTicketOutput format
          return {
            id: ticket.id_tcg_ticket,
            name: ticket.name || '',
            status: ticket.status || '',
            description: ticket.description || '',
            due_date: ticket.due_date || null,
            type: ticket.ticket_type || '',
            parent_ticket: ticket.parent_ticket || '',
            tags: ticket.tags || [],
            completed_at: ticket.completed_at || null,
            priority: ticket.priority || '',
            assigned_to: ticket.assigned_to || [],
            collections: ticket.collections || [],
            field_mappings: field_mappings,
          };
        }),
      );

      let res: UnifiedTicketOutput[] = unifiedTickets;
      if (remote_data) {
        const remote_array_data: UnifiedTicketOutput[] = await Promise.all(
          res.map(async (ticket) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: ticket.id,
              },
            });
            //TODO:
            let remote_data: any;
            if (resp && resp.data) {
              remote_data = JSON.parse(resp.data);
            }
            return { ...ticket, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.ticket.pulled',
          method: 'GET',
          url: '/ticketing/tickets',
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
  async updateTicket(
    id: string,
    updateTicketData: Partial<UnifiedTicketInput>,
  ): Promise<UnifiedTicketOutput> {
    try {
    } catch (error) {}
    // TODO: fetch the ticket from the database using 'id'
    // TODO: update the ticket with 'updateTicketData'
    // TODO: save the updated ticket back to the database
    // TODO: return the updated ticket
    return;
  }
}
