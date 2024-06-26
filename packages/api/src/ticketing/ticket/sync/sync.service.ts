import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { UnifiedTicketOutput } from '../types/model.unified';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { tcg_tickets as TicketingTicket } from '@prisma/client';
import { ITicketService } from '../types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../services/registry.service';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'ticket', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ticketing-sync-tickets',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our tcg_tickets table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async syncTickets(user_id?: string) {
    try {
      this.logger.log(`Syncing tickets....`);
      const users = user_id
        ? [
            await this.prisma.users.findUnique({
              where: {
                id_user: user_id,
              },
            }),
          ]
        : await this.prisma.users.findMany();
      if (users && users.length > 0) {
        for (const user of users) {
          const projects = await this.prisma.projects.findMany({
            where: {
              id_user: user.id_user,
            },
          });
          for (const project of projects) {
            const id_project = project.id_project;
            const linkedUsers = await this.prisma.linked_users.findMany({
              where: {
                id_project: id_project,
              },
            });
            linkedUsers.map(async (linkedUser) => {
              try {
                const providers = TICKETING_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncTicketsForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                    );
                  } catch (error) {
                    throw error;
                  }
                }
              } catch (error) {
                throw error;
              }
            });
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTicketsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    wh_real_time_trigger?: {
      action: 'UPDATE' | 'DELETE';
      data: {
        remote_id: string;
      };
    },
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} tickets for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ticketing',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping tickets syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticketing.ticket',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);

      let resp: ApiResponse<OriginalTicketOutput[]>;
      if (wh_real_time_trigger && wh_real_time_trigger.data.remote_id) {
        //meaning the call has been from a real time webhook that received data from a 3rd party
        switch (wh_real_time_trigger.action) {
          case 'DELETE':
            return await this.removeTicketInDb(
              connection.id_connection,
              wh_real_time_trigger.data.remote_id,
            );
          default:
            resp = await service.syncTickets(
              linkedUserId,
              wh_real_time_trigger.data.remote_id,
              remoteProperties,
            );
            break;
        }
      } else {
        resp = await service.syncTickets(
          linkedUserId,
          undefined,
          remoteProperties,
        );
      }

      const sourceObject: OriginalTicketOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedTicketOutput,
        OriginalTicketOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'ticketing',
        'ticket',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    tickets: UnifiedTicketOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTicket[]> {
    try {
      let tickets_results: TicketingTicket[] = [];
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const originId = ticket.remote_id;

        if (!originId || originId == '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingTicket = await this.prisma.tcg_tickets.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ticketing_ticket_id: string;

        if (existingTicket) {
          // Update the existing ticket
          let data: any = {
            modified_at: new Date(),
          };
          if (ticket.name) {
            data = { ...data, name: ticket.name };
          }
          if (ticket.status) {
            data = { ...data, status: ticket.status };
          }
          if (ticket.description) {
            data = { ...data, description: ticket.description };
          }
          if (ticket.type) {
            data = { ...data, ticket_type: ticket.type };
          }
          if (ticket.tags) {
            data = { ...data, tags: ticket.tags };
          }
          if (ticket.priority) {
            data = { ...data, priority: ticket.priority };
          }
          if (ticket.completed_at) {
            data = { ...data, completed_at: ticket.completed_at };
          }
          if (ticket.assigned_to) {
            data = { ...data, assigned_to: ticket.assigned_to };
          }
          /*
            parent_ticket: ticket.parent_ticket || 'd',
          */
          const res = await this.prisma.tcg_tickets.update({
            where: {
              id_tcg_ticket: existingTicket.id_tcg_ticket,
            },
            data: data,
          });
          unique_ticketing_ticket_id = res.id_tcg_ticket;
          tickets_results = [...tickets_results, res];
        } else {
          // Create a new ticket
          this.logger.log('not existing ticket ' + ticket.name);

          let data: any = {
            id_tcg_ticket: uuidv4(),
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };
          if (ticket.name) {
            data = { ...data, name: ticket.name };
          }
          if (ticket.status) {
            data = { ...data, status: ticket.status };
          }
          if (ticket.description) {
            data = { ...data, description: ticket.description };
          }
          if (ticket.type) {
            data = { ...data, ticket_type: ticket.type };
          }
          if (ticket.tags) {
            data = { ...data, tags: ticket.tags };
          }
          if (ticket.priority) {
            data = { ...data, priority: ticket.priority };
          }
          if (ticket.completed_at) {
            data = { ...data, completed_at: ticket.completed_at };
          }
          if (ticket.assigned_to) {
            data = { ...data, assigned_to: ticket.assigned_to };
          }
          if (ticket.project_id) {
            data = { ...data, collections: [ticket.project_id] };
          }
          /*
            parent_ticket: ticket.parent_ticket || 'd',
          */

          const res = await this.prisma.tcg_tickets.create({
            data: data,
          });
          unique_ticketing_ticket_id = res.id_tcg_ticket;
          tickets_results = [...tickets_results, res];
        }

        // check duplicate or existing values
        if (ticket.field_mappings && ticket.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_ticket_id,
            },
          });

          for (const [slug, value] of Object.entries(ticket.field_mappings)) {
            const attribute = await this.prisma.attribute.findFirst({
              where: {
                slug: slug,
                source: originSource,
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
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
          update: {
            data: JSON.stringify(remote_data[i]),
            created_at: new Date(),
          },
        });
      }
      return tickets_results;
    } catch (error) {
      throw error;
    }
  }
  async removeTicketInDb(connection_id: string, remote_id: string) {
    const existingTicket = await this.prisma.tcg_tickets.findFirst({
      where: {
        remote_id: remote_id,
        id_connection: connection_id,
      },
    });
    await this.prisma.tcg_tickets.delete({
      where: {
        id_tcg_ticket: existingTicket.id_tcg_ticket,
      },
    });
  }
}
