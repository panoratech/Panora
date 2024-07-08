import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TICKETING_PROVIDERS } from '@panora/shared';
import { tcg_tags as TicketingTag } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITagService } from '../types';
import { UnifiedTagOutput } from '../types/model.unified';

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
    this.registry.registerService('ticketing', 'tag', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ticketing-sync-tags',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  //function used by sync worker which populate our tcg_tags table
  //its role is to fetch all tags from providers 3rd parties and save the info inside our db
  //@Cron('*/2 * * * *') // every 2 minutes (for testing)
  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log(`Syncing tags....`);
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
                    const connection = await this.prisma.connections.findFirst({
                      where: {
                        id_linked_user: linkedUser.id_linked_user,
                        provider_slug: provider.toLowerCase(),
                      },
                    });
                    //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                    const tickets = await this.prisma.tcg_tickets.findMany({
                      where: {
                        id_connection: connection.id_connection,
                      },
                    });
                    for (const ticket of tickets) {
                      await this.syncForLinkedUser({
                        integrationId: provider,
                        linkedUserId: linkedUser.id_linked_user,
                        id_ticket: ticket.id_tcg_ticket,
                      });
                    }
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
  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_ticket } = data;
      const service: ITagService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedTagOutput,
        OriginalTagOutput,
        ITagService
      >(integrationId, linkedUserId, 'ticketing', 'tag', service, [
        {
          param: id_ticket,
          paramName: 'id_ticket',
          shouldPassToService: true,
          shouldPassToIngest: true,
        },
      ]);

      //TODO; do it in every file
      /*if (!sourceObject || sourceObject.length == 0) {
        this.logger.warn('Source object is empty, returning :) ....');
        return;
      }*/
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    tags: UnifiedTagOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_ticket: string,
  ): Promise<TicketingTag[]> {
    try {
      const tags_results: TicketingTag[] = [];

      const updateOrCreateTag = async (
        tag: UnifiedTagOutput,
        originId: string,
        connection_id: string,
        id_ticket: string,
      ) => {
        let existingTag;
        if (!originId) {
          existingTag = await this.prisma.tcg_tags.findFirst({
            where: {
              name: tag.name,
              id_connection: connection_id,
            },
          });
        } else {
          existingTag = await this.prisma.tcg_tags.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          name: tag.name ?? null,
          modified_at: new Date(),
          id_tcg_ticket: id_ticket ?? null,
        };

        if (existingTag) {
          return await this.prisma.tcg_tags.update({
            where: {
              id_tcg_tag: existingTag.id_tcg_tag,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.tcg_tags.create({
            data: {
              ...baseData,
              id_tcg_tag: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const originId = tag.remote_id;

        const res = await updateOrCreateTag(
          tag,
          originId,
          connection_id,
          id_ticket,
        );
        const tag_id = res.id_tcg_tag;
        tags_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          tag.field_mappings,
          tag_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(tag_id, remote_data[i]);
      }
      return tags_results;
    } catch (error) {
      throw error;
    }
  }
}
