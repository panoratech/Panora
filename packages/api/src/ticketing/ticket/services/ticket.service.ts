import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '../types/model.unified';
import { ITicketService, TicketResponse } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from './registry.service';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
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
      handleServiceError(error, this.logger);
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
      if (!linkedUser) throw new Error('Linked User Not Found');
      const acc = unifiedTicketData.account_id;
      //check if contact_id and account_id refer to real uuids
      if (acc) {
        const search = await this.prisma.tcg_accounts.findUnique({
          where: {
            id_tcg_account: acc,
          },
        });
        if (!search)
          throw new Error('You inserted an account_id which does not exist');
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
          throw new Error('You inserted a contact_id which does not exist');
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
            throw new Error('You inserted an assignee which does not exist');
        });
      }
      // Retrieve custom field mappings
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticket',
        );
      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<UnifiedTicketInput>({
        sourceObject: unifiedTicketData,
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        customFieldMappings: unifiedTicketData.field_mappings
          ? customFieldMappings
          : [],
      });

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTicketOutput> = await service.addTicket(
        desunifiedObject,
        linkedUserId,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalTicketOutput[]>({
        sourceObject: [resp.data],
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        customFieldMappings: customFieldMappings,
      })) as UnifiedTicketOutput[];

      // add the ticket inside our db
      const source_ticket = resp.data;
      const target_ticket = unifiedObject[0];
      const originId =
        'id' in source_ticket ? String(source_ticket.id) : undefined; //TODO

      const existingTicket = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: originId,
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
        this.logger.log('not existing ticket ' + target_ticket.name);

        let data: any = {
          id_tcg_ticket: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_linked_user: linkedUserId,
          remote_id: originId,
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

        for (const mapping of target_ticket.field_mappings) {
          const attribute = await this.prisma.attribute.findFirst({
            where: {
              slug: Object.keys(mapping)[0],
              source: integrationId,
              id_consumer: linkedUserId,
            },
          });

          if (attribute) {
            await this.prisma.value.create({
              data: {
                id_value: uuidv4(),
                data: Object.values(mapping)[0] || 'null',
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
      if (remote_data) {
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
      }

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
          url: '/ticketing/ticket',
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
      handleServiceError(error, this.logger);
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
      handleServiceError(error, this.logger);
    }
  }

  async getTickets(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<UnifiedTicketOutput[]> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      const tickets = await this.prisma.tcg_tickets.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
        /* TODO: only if params 
        include: {
          tcg_comments: true,
        },*/
      });

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
          url: '/ticketing/ticket',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  //TODO
  async updateTicket(
    id: string,
    updateTicketData: Partial<UnifiedTicketInput>,
  ): Promise<TicketResponse> {
    try {
    } catch (error) {
      handleServiceError(error, this.logger);
    }
    // TODO: fetch the ticket from the database using 'id'
    // TODO: update the ticket with 'updateTicketData'
    // TODO: save the updated ticket back to the database
    // TODO: return the updated ticket
    return;
  }
}
