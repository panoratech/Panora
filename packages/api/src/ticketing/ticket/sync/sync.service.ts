import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_tickets as TicketingTicket } from '@prisma/client';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { UnifiedTicketingCollectionOutput } from '@ticketing/collection/types/model.unified';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITicketService } from '../types';
import { UnifiedTicketingTicketOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'ticket', this);
  }
  onModuleInit() {
//
  }

  //function used by sync worker which populate our tcg_tickets table
  //its role is to fetch all contacts from providers 3rd parties and save the info inside our db
  // @Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(id_project?: string) {
    try {
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
              await this.syncForLinkedUser({
                integrationId: provider,
                linkedUserId: linkedUser.id_linked_user,
              });
            } catch (error) {
              throw error;
            }
          }
        } catch (error) {
          throw error;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  //todo: HANDLE DATA REMOVED FROM PROVIDER
  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, wh_real_time_trigger } = param;
      const service: ITicketService =
        this.serviceRegistry.getService(integrationId);

      if (!service) {
        this.logger.log(
          `No service found in {vertical:ticketing, commonObject: ticket} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedTicketingTicketOutput,
        OriginalTicketOutput,
        ITicketService
      >(
        integrationId,
        linkedUserId,
        'ticketing',
        'ticket',
        service,
        [],
        wh_real_time_trigger,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    tickets: UnifiedTicketingTicketOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<TicketingTicket[]> {
    try {
      const tickets_results: TicketingTicket[] = [];

      const updateOrCreateTicket = async (
        ticket: UnifiedTicketingTicketOutput,
        originId: string,
        connection_id: string,
      ) => {
        const existingTicket = await this.prisma.tcg_tickets.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          modified_at: new Date(),
          name: ticket.name ?? null,
          status: ticket.status ?? null,
          description: ticket.description ?? null,
          ticket_type: ticket.type ?? null,
          priority: ticket.priority ?? null,
          completed_at: ticket.completed_at ?? null,
          assigned_to: ticket.assigned_to ?? [],
          tags: [],
          collections: [],
          id_linked_user: linkedUserId,
        };

        if (existingTicket) {
          return await this.prisma.tcg_tickets.update({
            where: {
              id_tcg_ticket: existingTicket.id_tcg_ticket,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_tickets.create({
            data: {
              ...baseData,
              id_tcg_ticket: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        const originId = ticket.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateTicket(ticket, originId, connection_id);
        const ticket_id = res.id_tcg_ticket;
        tickets_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          ticket.field_mappings,
          ticket_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(ticket_id, remote_data[i]);

        // Process collections
        if (ticket.collections && ticket.collections[0]) {
          let collections: string[] = [];
          if (typeof ticket.collections[0] === 'string') {
            collections.push(ticket.collections[0]);
          } else {
            const coll = await this.registry
              .getService('ticketing', 'collection')
              .saveToDb(
                connection_id,
                linkedUserId,
                ticket.collections,
                originSource,
                ticket.collections.map(
                  (col: UnifiedTicketingCollectionOutput) => col.remote_data,
                ),
              );
            collections = coll.map((c) => c.id_tcg_collection as string);
          }
          await this.prisma.tcg_tickets.update({
            where: {
              id_tcg_ticket: ticket_id,
            },
            data: {
              collections: collections,
            },
          });
        }

        // Process attachments
        if (ticket.attachments) {
          await this.registry.getService('ticketing', 'attachment').saveToDb(
            connection_id,
            linkedUserId,
            ticket.attachments,
            originSource,
            ticket.attachments.map(
              (att: UnifiedTicketingAttachmentOutput) => att.remote_data,
            ),
            {
              object_name: 'ticket',
              value: ticket_id,
            },
          );
        }

        // Process tags
        if (ticket.tags) {
          let TAGS: string[] = [];
          if (typeof ticket.tags[0] === 'string') {
            TAGS = ticket.tags as string[];
          } else {
            const tags = await this.registry
              .getService('ticketing', 'tag')
              .saveToDb(
                connection_id,
                linkedUserId,
                ticket.tags,
                originSource,
                ticket.tags.map(
                  (tag: UnifiedTicketingTagOutput) => tag.remote_data,
                ),
              );
            TAGS = tags.map((t) => t.id_tcg_tag as string);
          }

          await this.prisma.tcg_tickets.update({
            where: {
              id_tcg_ticket: ticket_id,
            },
            data: {
              tags: TAGS,
            },
          });
        }
      }
      return tickets_results;
    } catch (error) {
      throw error;
    }
  }

  async removeInDb(connection_id: string, remote_id: string) {
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
