import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './zendesk';
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
import { ServiceRegistry } from '@ticketing/@utils/@registry/registry.service';
import { OriginalTicketOutput } from '@@core/utils/types/original.output';
import { unify } from '@@core/utils/unification/unify';
import { normalizeComments } from '../utils';

@Injectable()
export class TicketService {
  constructor(
    private prisma: PrismaService,
    private zendesk: ZendeskService,
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
  ): Promise<ApiResponse<TicketResponse>> {
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

      const allTickets = responses.flatMap((response) => response.data.tickets);
      const allRemoteData = responses.flatMap(
        (response) => response.data.remote_data || [],
      );

      return {
        data: {
          tickets: allTickets,
          remote_data: allRemoteData,
        },
        message: 'All tickets inserted successfully',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async addTicket(
    unifiedTicketData: UnifiedTicketInput,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.ticket.created', //sync, push or pull
          method: 'POST',
          url: '/ticketing/ticket',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;

      //TODO
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
          events: {
            id_linked_user: linkedUserId,
          },
        },
        include: { tcg_comments: true },
      });

      const { normalizedComments } = normalizeComments(target_ticket.comments);

      let unique_ticketing_ticket_id: string;

      if (existingTicket) {
        // Update the existing ticket
        const res = await this.prisma.tcg_tickets.update({
          where: {
            id_tcg_ticket: existingTicket.id_tcg_ticket,
          },
          data: {
            name: target_ticket.name || '',
            status: target_ticket.status || '',
            description: target_ticket.description || '',
            due_date: target_ticket.due_date || '',
            ticket_type: target_ticket.type || '',
            parent_ticket: target_ticket.parent_ticket || '',
            tags: target_ticket.tags || '',
            completed_at: target_ticket.completed_at || '',
            priority: target_ticket.priority || '',
            assigned_to: target_ticket.assigned_to || [],
            modified_at: new Date(),
            tcg_comments: {
              update: normalizedComments.map((comment, index) => ({
                where: {
                  id_tcg_ticket:
                    existingTicket.tcg_comments[index].id_tcg_ticket,
                  id_tcg_comment:
                    existingTicket.tcg_comments[index].id_tcg_comment,
                },
                data: comment,
              })),
            },
          },
        });
        unique_ticketing_ticket_id = res.id_tcg_ticket;
      } else {
        // Create a new ticket
        this.logger.log('not existing ticket ' + target_ticket.name);
        const data = {
          id_tcg_ticket: uuidv4(),
          name: target_ticket.name || '',
          status: target_ticket.status || '',
          description: target_ticket.description || '',
          due_date: target_ticket.due_date || '',
          ticket_type: target_ticket.type || '',
          parent_ticket: target_ticket.parent_ticket || '',
          tags: target_ticket.tags || '',
          completed_at: target_ticket.completed_at || '',
          priority: target_ticket.priority || '',
          assigned_to: target_ticket.assigned_to || [],
          created_at: new Date(),
          modified_at: new Date(),
          id_event: job_id,
          remote_id: originId,
          remote_platform: integrationId,
        };

        if (normalizedComments) {
          data['tcg_comments'] = {
            create: normalizedComments,
          };
        }

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

      /////
      const result_ticket = await this.getTicket(
        unique_ticketing_ticket_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: status_resp,
        },
      });
      await this.webhook.handleWebhook(
        result_ticket.data.tickets,
        'ticketing.ticket.created',
        linkedUser.id_project,
        job_id,
      );
      return { ...resp, data: result_ticket.data };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getTicket(
    id_ticketing_ticket: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    try {
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: id_ticketing_ticket,
        },
        include: {
          tcg_comments: true,
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
        tags: ticket.tags || '',
        completed_at: ticket.completed_at || null,
        priority: ticket.priority || '',
        assigned_to: ticket.assigned_to || [],
        comments: ticket.tcg_comments.map((comment) => ({
          remote_id: comment.remote_id,
          body: comment.body,
          html_body: comment.html_body,
          is_private: comment.is_private,
        })),
        field_mappings: field_mappings,
      };

      let res: TicketResponse = {
        tickets: [unifiedTicket],
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
          remote_data: [remote_data],
        };
      }

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getTickets(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<ApiResponse<TicketResponse>> {
    try {
      //TODO: handle case where data is not there (not synced) or old synced
      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized',
          type: 'ticketing.ticket.pull',
          method: 'GET',
          url: '/ticketing/ticket',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const job_id = job_resp_create.id_event;
      const tickets = await this.prisma.tcg_tickets.findMany({
        where: {
          remote_id: integrationId.toLowerCase(),
          events: {
            id_linked_user: linkedUserId,
          },
        },
        include: {
          tcg_comments: true,
        },
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
            remote_id: ticket.remote_id || '',
            status: ticket.status || '',
            description: ticket.description || '',
            due_date: ticket.due_date || null,
            type: ticket.ticket_type || '',
            parent_ticket: ticket.parent_ticket || '',
            tags: ticket.tags || '',
            completed_at: ticket.completed_at || null,
            priority: ticket.priority || '',
            assigned_to: ticket.assigned_to || [],
            comments: ticket.tcg_comments.map((comment) => ({
              remote_id: comment.remote_id,
              body: comment.body,
              html_body: comment.html_body,
              is_private: comment.is_private,
            })),
            field_mappings: field_mappings,
          };
        }),
      );

      let res: TicketResponse = {
        tickets: unifiedTickets,
      };

      if (remote_data) {
        const remote_array_data: Record<string, any>[] = await Promise.all(
          tickets.map(async (ticket) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: ticket.id_tcg_ticket,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return remote_data;
          }),
        );

        res = {
          ...res,
          remote_data: remote_array_data,
        };
      }
      await this.prisma.events.update({
        where: {
          id_event: job_id,
        },
        data: {
          status: 'success',
        },
      });

      return {
        data: res,
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  //TODO
  async updateTicket(
    id: string,
    updateTicketData: Partial<UnifiedTicketInput>,
  ): Promise<ApiResponse<TicketResponse>> {
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
