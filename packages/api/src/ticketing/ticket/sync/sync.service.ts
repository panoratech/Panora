import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { SyncError, throwTypedError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';

import { TicketingObject } from '@ticketing/@lib/@types';
import { UnifiedTicketOutput } from '../types/model.unified';
import { WebhookService } from '@@core/webhook/webhook.service';
import { tcg_tickets as TicketingTicket } from '@prisma/client';
import { ITicketService } from '../types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../services/registry.service';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { CoreUnification } from '@@core/utils/services/core.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'ticketing-sync-tickets';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
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
                      id_project,
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
    id_project: string,
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
              linkedUserId,
              integrationId,
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
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalTicketOutput[]
      >({
        sourceObject,
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        vertical: 'ticketing',
        customFieldMappings,
      })) as UnifiedTicketOutput[];

      //insert the data in the DB with the fieldMappings (value table)
      const tickets_data = await this.saveTicketsInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.ticket.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        tickets_data,
        'ticketing.ticket.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveTicketsInDb(
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
            remote_platform: originSource,
            id_linked_user: linkedUserId,
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
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
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
  async removeTicketInDb(
    linkedUserId: string,
    originSource: string,
    remote_id: string,
  ) {
    const existingTicket = await this.prisma.tcg_tickets.findFirst({
      where: {
        remote_id: remote_id,
        remote_platform: originSource,
        id_linked_user: linkedUserId,
      },
    });
    await this.prisma.tcg_tickets.delete({
      where: {
        id_tcg_ticket: existingTicket.id_tcg_ticket,
      },
    });
  }
}
