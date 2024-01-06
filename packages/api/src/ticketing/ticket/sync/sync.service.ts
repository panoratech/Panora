import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { UnifiedTicketOutput } from '../types/model.unified';
import { WebhookService } from '@@core/webhook/webhook.service';
import { tcg_tickets as TicketingTicket } from '@prisma/client';
import { ITicketService } from '../types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { ServiceRegistry } from '../services/registry.service';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.syncTickets();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  @Cron('*/20 * * * *')
  //function used by sync worker which populate our tcg_tickets table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  async syncTickets() {
    try {
      this.logger.log(`Syncing tickets....`);
      const defaultOrg = await this.prisma.organizations.findFirst({
        where: {
          name: 'Acme Inc',
        },
      });

      const defaultProject = await this.prisma.projects.findFirst({
        where: {
          id_organization: defaultOrg.id_organization,
          name: 'Project 1',
        },
      });
      const id_project = defaultProject.id_project;
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
              handleServiceError(error, this.logger);
            }
          }
        } catch (error) {
          handleServiceError(error, this.logger);
        }
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncTicketsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
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
        },
      });
      if (!connection) return;

      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ticket',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalTicketOutput[]> =
        await service.syncTickets(linkedUserId, remoteProperties);

      const sourceObject: OriginalTicketOutput[] = resp.data;
      //this.logger.log('SOURCE OBJECT DATA = ' + JSON.stringify(sourceObject));
      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<OriginalTicketOutput[]>({
        sourceObject,
        targetType: TicketingObject.ticket,
        providerName: integrationId,
        customFieldMappings,
      })) as UnifiedTicketOutput[];

      //remote Ids in provider's tools
      const ticketIds = sourceObject.map((ticket) =>
        'id' in ticket ? String(ticket.id) : undefined,
      );

      //insert the data in the DB with the fieldMappings (value table)
      const tickets_data = await this.saveTicketsInDb(
        linkedUserId,
        unifiedObject,
        ticketIds,
        integrationId,
        sourceObject,
      );

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.ticket.synced',
          method: 'SYNC',
          url: '/sync',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      await this.webhook.handleWebhook(
        tickets_data,
        'ticketing.ticket.synced',
        id_project,
        event.id_event,
      );
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async saveTicketsInDb(
    linkedUserId: string,
    tickets: UnifiedTicketOutput[],
    originIds: string[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTicket[]> {
    try {
      let tickets_results: TicketingTicket[] = [];
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const originId = originIds[i];

        if (!originId || originId == '') {
          throw new NotFoundError(`Origin id not there, found ${originId}`);
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
          const res = await this.prisma.tcg_tickets.update({
            where: {
              id_tcg_ticket: existingTicket.id_tcg_ticket,
            },
            data: {
              name: ticket.name || '',
              status: ticket.status || '',
              description: ticket.description || '',
              due_date: ticket.due_date || '',
              ticket_type: ticket.type || '',
              parent_ticket: ticket.parent_ticket || '',
              tags: ticket.tags || [],
              completed_at: ticket.completed_at || '',
              priority: ticket.priority || '',
              assigned_to: ticket.assigned_to || [],
              modified_at: new Date(),
            },
          });
          unique_ticketing_ticket_id = res.id_tcg_ticket;
          tickets_results = [...tickets_results, res];
        } else {
          // Create a new ticket
          this.logger.log('not existing ticket ' + ticket.name);
          const data = {
            id_tcg_ticket: uuidv4(),
            name: ticket.name || '',
            status: ticket.status || '',
            description: ticket.description || '',
            due_date: ticket.due_date || '',
            ticket_type: ticket.type || '',
            parent_ticket: ticket.parent_ticket || '',
            tags: ticket.tags || [],
            completed_at: ticket.completed_at || '',
            priority: ticket.priority || '',
            assigned_to: ticket.assigned_to || [],
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };
          const res = await this.prisma.tcg_tickets.create({
            data: data,
          });
          tickets_results = [...tickets_results, res];
          unique_ticketing_ticket_id = res.id_tcg_ticket;
        }

        // check duplicate or existing values
        if (ticket.field_mappings && ticket.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ticketing_ticket_id,
            },
          });

          for (const mapping of ticket.field_mappings) {
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
      handleServiceError(error, this.logger);
    }
  }
}
