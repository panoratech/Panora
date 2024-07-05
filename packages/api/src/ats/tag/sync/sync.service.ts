import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync } from '@@core/utils/types/interface';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { ats_candidate_tags as AtsTag } from '@prisma/client';
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
    this.registry.registerService('ats', 'tag', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob('ats-sync-tags', '0 0 * * *');
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncTags(user_id?: string) {
    try {
      this.logger.log('Syncing tags...');
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
                const providers = FILESTORAGE_PROVIDERS;
                for (const provider of providers) {
                  try {
                    await this.syncTagsForLinkedUser(
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

  async syncTagsForLinkedUser(integrationId: string, linkedUserId: string) {
    try {
      this.logger.log(
        `Syncing ${integrationId} tags for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'ats',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping tags syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'ats.tag',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ITagService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalTagOutput[]> = await service.syncTags(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalTagOutput[] = resp.data;

      await this.ingestService.ingestData<UnifiedTagOutput, OriginalTagOutput>(
        sourceObject,
        integrationId,
        connection.id_connection,
        'ats',
        'tag',
        customFieldMappings,
      );
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
  ): Promise<AtsTag[]> {
    try {
      let tags_results: AtsTag[] = [];
      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const originId = tag.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingTag = await this.prisma.ats_candidate_tags.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_ats_tag_id: string;

        if (existingTag) {
          // Update the existing tag
          let data: any = {
            modified_at: new Date(),
          };
          if (tag.name) {
            data = { ...data, name: tag.name };
          }
          const res = await this.prisma.ats_candidate_tags.update({
            where: {
              id_ats_candidate_tag: existingTag.id_ats_candidate_tag,
            },
            data: data,
          });
          unique_ats_tag_id = res.id_ats_candidate_tag;
          tags_results = [...tags_results, res];
        } else {
          // Create a new tag
          this.logger.log('Tag does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_ats_candidate_tag: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (tag.name) {
            data = { ...data, name: tag.name };
          }

          const newTag = await this.prisma.ats_candidate_tags.create({
            data: data,
          });

          unique_ats_tag_id = newTag.id_ats_candidate_tag;
          tags_results = [...tags_results, newTag];
        }

        // check duplicate or existing values
        if (tag.field_mappings && tag.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_ats_tag_id,
            },
          });

          for (const [slug, value] of Object.entries(tag.field_mappings)) {
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

        // insert remote_data in db
        await this.prisma.remote_data.upsert({
          where: {
            ressource_owner_id: unique_ats_tag_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_ats_tag_id,
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
      return tags_results;
    } catch (error) {
      throw error;
    }
  }
}
