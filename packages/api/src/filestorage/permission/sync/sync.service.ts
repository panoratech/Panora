import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { fs_permissions as FileStoragePermission } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedFilestoragePermissionOutput } from '../types/model.unified';

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

  async kickstartSync(id_project?: string) {
    return;
  }

  // permissions are synced within file, folders, users, groups

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    permissions: UnifiedFilestoragePermissionOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    extra?: {
      object_name: 'file' | 'folder';
      value: string;
    },
  ): Promise<FileStoragePermission[]> {
    try {
      const permissions_results: FileStoragePermission[] = [];

      const updateOrCreatePermission = async (
        permission: UnifiedFilestoragePermissionOutput,
        originId: string,
        extra: { object_name: 'file' | 'folder'; value: string },
      ) => {
        let existingPermission;

        if (!originId) {
          if (extra.object_name === 'file') {
            const file = await this.prisma.fs_files.findUnique({
              where: {
                id_fs_file: extra.value,
              },
            });
            if (file?.id_fs_permissions?.length > 0) {
              existingPermission = await this.prisma.fs_permissions.findMany({
                where: {
                  id_fs_permission: {
                    in: file.id_fs_permissions,
                  },
                },
              });
            }
          } else {
            const folder = await this.prisma.fs_folders.findUnique({
              where: {
                id_fs_folder: extra.value,
              },
            });
            if (folder?.id_fs_permissions?.length > 0) {
              existingPermission = await this.prisma.fs_permissions.findMany({
                where: {
                  id_fs_permission: {
                    in: folder.id_fs_permissions,
                  },
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

        const baseData: any = {
          roles: permission.roles ?? null,
          type: permission.type ?? null,
          user: permission.user_id ?? null,
          group: permission.group_id ?? null,
          modified_at: new Date(),
        };

        if (existingPermission) {
          return await this.prisma.fs_permissions.update({
            where: {
              id_fs_permission: existingPermission.id_fs_permission,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_permissions.create({
            data: {
              ...baseData,
              id_fs_permission: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const originId = permission.remote_id;

        const res = await updateOrCreatePermission(permission, originId, extra);
        const permission_id = res.id_fs_permission;
        permissions_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          permission.field_mappings,
          permission_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          permission_id,
          remote_data[i],
        );
      }
      return permissions_results;
    } catch (error) {
      throw error;
    }
  }
}
