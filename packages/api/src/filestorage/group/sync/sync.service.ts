import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { ApiResponse } from '@@core/utils/types';
import { IGroupService } from '../types';
import { UnifiedGroupOutput } from '../types/model.unified';
import { fs_groups as FileStorageGroup } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';

import { OriginalGroupOutput } from '@@core/utils/types/original/original.file-storage';

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
    this.registry.registerService('filestorage', 'group', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-groups',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncGroups(user_id?: string) {
    try {
      this.logger.log('Syncing groups...');
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
                    await this.syncGroupsForLinkedUser(
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

  async syncGroupsForLinkedUser(integrationId: string, linkedUserId: string) {
    try {
      this.logger.log(
        `Syncing ${integrationId} groups for linkedUser ${linkedUserId}`,
      );
      // check if linkedUser has a connection if not just stop sync
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: integrationId,
          vertical: 'filestorage',
        },
      });
      if (!connection) {
        this.logger.warn(
          `Skipping groups syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.group',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IGroupService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalGroupOutput[]> = await service.syncGroups(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalGroupOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedGroupOutput,
        OriginalGroupOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'filestorage',
        'group',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    groups: UnifiedGroupOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageGroup[]> {
    try {
      let groups_results: FileStorageGroup[] = [];
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const originId = group.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingGroup = await this.prisma.fs_groups.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_fs_group_id: string;

        if (existingGroup) {
          // Update the existing group
          let data: any = {
            modified_at: new Date(),
          };
          if (group.name) {
            data = { ...data, name: group.name };
          }
          if (group.users) {
            data = { ...data, users: group.users };
          }
          if (group.remote_was_deleted) {
            data = { ...data, remote_was_deleted: group.remote_was_deleted };
          }
          const res = await this.prisma.fs_groups.update({
            where: {
              id_fs_group: existingGroup.id_fs_group,
            },
            data: data,
          });
          unique_fs_group_id = res.id_fs_group;
          groups_results = [...groups_results, res];
        } else {
          // Create a new group
          this.logger.log('Group does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_group: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (group.name) {
            data = { ...data, name: group.name };
          }
          if (group.users) {
            data = { ...data, users: group.users };
          }
          if (group.remote_was_deleted) {
            data = { ...data, remote_was_deleted: group.remote_was_deleted };
          }

          const newGroup = await this.prisma.fs_groups.create({
            data: data,
          });

          unique_fs_group_id = newGroup.id_fs_group;
          groups_results = [...groups_results, newGroup];
        }

        // check duplicate or existing values
        if (group.field_mappings && group.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_group_id,
            },
          });

          for (const [slug, value] of Object.entries(group.field_mappings)) {
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
            ressource_owner_id: unique_fs_group_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_group_id,
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
      return groups_results;
    } catch (error) {
      throw error;
    }
  }
}
