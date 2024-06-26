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
import { IPermissionService } from '../types';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedPermissionOutput } from '../types/model.unified';
import { fs_permissions as FileStoragePermission } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';
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
    this.registry.registerService('filestorage', 'permission', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-permissions',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncPermissions(user_id?: string) {
    try {
      this.logger.log('Syncing permissions...');
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
                    await this.syncPermissionsForLinkedUser(
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

  async syncPermissionsForLinkedUser(
    integrationId: string,
    linkedUserId: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} permissions for linkedUser ${linkedUserId}`,
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
          `Skipping permissions syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.permission',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IPermissionService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalPermissionOutput[]> =
        await service.syncPermissions(linkedUserId, remoteProperties);

      const sourceObject: OriginalPermissionOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedPermissionOutput,
        OriginalPermissionOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'filestorage',
        'permission',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    permissions: UnifiedPermissionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStoragePermission[]> {
    try {
      let permissions_results: FileStoragePermission[] = [];
      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const originId = permission.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingPermission = await this.prisma.fs_permissions.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_fs_permission_id: string;

        if (existingPermission) {
          // Update the existing permission
          let data: any = {
            modified_at: new Date(),
          };
          if (permission.roles) {
            data = { ...data, roles: permission.roles };
          }
          if (permission.type) {
            data = { ...data, type: permission.type };
          }
          if (permission.user_id) {
            data = { ...data, user_id: permission.user_id };
          }
          if (permission.group_id) {
            data = { ...data, group_id: permission.group_id };
          }
          const res = await this.prisma.fs_permissions.update({
            where: {
              id_fs_permission: existingPermission.id_fs_permission,
            },
            data: data,
          });
          unique_fs_permission_id = res.id_fs_permission;
          permissions_results = [...permissions_results, res];
        } else {
          // Create a new permission
          this.logger.log('Permission does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_permission: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (permission.roles) {
            data = { ...data, roles: permission.roles };
          }
          if (permission.type) {
            data = { ...data, type: permission.type };
          }
          if (permission.user_id) {
            data = { ...data, user_id: permission.user_id };
          }
          if (permission.group_id) {
            data = { ...data, group_id: permission.group_id };
          }

          const newPermission = await this.prisma.fs_permissions.create({
            data: data,
          });

          unique_fs_permission_id = newPermission.id_fs_permission;
          permissions_results = [...permissions_results, newPermission];
        }

        // check duplicate or existing values
        if (permission.field_mappings && permission.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_permission_id,
            },
          });

          for (const [slug, value] of Object.entries(
            permission.field_mappings,
          )) {
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
            ressource_owner_id: unique_fs_permission_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_permission_id,
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
      return permissions_results;
    } catch (error) {
      throw error;
    }
  }
}
