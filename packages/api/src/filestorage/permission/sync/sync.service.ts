import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { fs_permissions as FileStoragePermission } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedPermissionOutput } from '../types/model.unified';

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
    return;
  }

  // permissions are synced within file, folders, users, groups

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    permissions: UnifiedPermissionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    extra?: {
      object_name: 'file' | 'folder';
      value: string;
    },
  ): Promise<FileStoragePermission[]> {
    try {
      let permissions_results: FileStoragePermission[] = [];
      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const originId = permission.remote_id;

        let existingPermission;
        if (!originId) {
          // check if perm exists for the file or folder id in question
          if (extra.object_name == 'file') {
            const file = await this.prisma.fs_files.findUnique({
              where: {
                id_fs_file: extra.value,
              },
            });
            if (file.id_fs_permission) {
              existingPermission = await this.prisma.fs_permissions.findUnique({
                where: {
                  id_fs_permission: file.id_fs_permission,
                },
              });
            }
          } else {
            const folder = await this.prisma.fs_folders.findUnique({
              where: {
                id_fs_folder: extra.value,
              },
            });
            if (folder.id_fs_permission) {
              existingPermission = await this.prisma.fs_permissions.findUnique({
                where: {
                  id_fs_permission: folder.id_fs_permission,
                },
              });
            }
          }
        } else {
          existingPermission = await this.prisma.fs_permissions.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

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
            remote_id: originId || null,
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
