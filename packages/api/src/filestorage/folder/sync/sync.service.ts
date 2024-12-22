import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_folders as FileStorageFolder } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFolderService } from '../types';
import { UnifiedFilestorageFolderOutput } from '../types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { fs_permissions as FileStoragePermission } from '@prisma/client';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private registry: CoreSyncRegistry,
    private bullQueueService: BullQueueService,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('filestorage', 'folder', this);
  }
  onModuleInit() {
    //
  }

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
          const providers = FILESTORAGE_PROVIDERS;
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

  async syncForLinkedUser(param: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId } = param;
      const service: IFolderService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFilestorageFolderOutput,
        OriginalFolderOutput,
        IFolderService
      >(integrationId, linkedUserId, 'filestorage', 'folder', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    folders: UnifiedFilestorageFolderOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageFolder[]> {
    try {
      const folders_results: FileStorageFolder[] = [];
      const driveLookupCache = new Map<string, string | null>();

      const updateOrCreateFolder = async (
        folder: UnifiedFilestorageFolderOutput,
        originId: string,
      ) => {
        const existingFolder = await this.prisma.fs_folders.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let drive_id_by_remote_drive_id = null;
        if (folder.remote_drive_id) {
          if (driveLookupCache.has(folder.remote_drive_id)) {
            drive_id_by_remote_drive_id = driveLookupCache.get(
              folder.remote_drive_id,
            );
          } else {
            const drive = await this.prisma.fs_drives.findFirst({
              where: {
                remote_id: folder.remote_drive_id,
                id_connection: connection_id,
              },
              select: {
                id_fs_drive: true,
              },
            });
            drive_id_by_remote_drive_id = drive?.id_fs_drive ?? null;
            driveLookupCache.set(
              folder.remote_drive_id,
              drive_id_by_remote_drive_id,
            );
          }
        }

        const baseData: any = {
          name: folder.name ?? null,
          size: folder.size ?? null,
          folder_url: folder.folder_url ?? null,
          description: folder.description ?? null,
          id_fs_drive: drive_id_by_remote_drive_id ?? null,
          id_fs_permissions: folder.permissions,
          parent_folder: folder.parent_folder_id ?? null,
          modified_at: new Date(),
          remote_created_at: folder.remote_created_at ?? null,
          remote_modified_at: folder.remote_modified_at ?? null,
          remote_was_deleted: folder.remote_was_deleted ? true : false,
        };

        // remove null values
        const cleanData = Object.fromEntries(
          Object.entries(baseData).filter(([_, value]) => value !== null),
        );

        if (existingFolder) {
          return await this.prisma.fs_folders.update({
            where: {
              id_fs_folder: existingFolder.id_fs_folder,
            },
            data: cleanData,
          });
        } else {
          return await this.prisma.fs_folders.create({
            data: {
              ...baseData, // using baseData for creation
              id_fs_folder: folder.id ?? uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        const originId = folder.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateFolder(folder, originId);
        const folder_id = res.id_fs_folder;
        folders_results.push(res);

        if (folder.shared_link) {
          if (typeof folder.shared_link === 'string') {
            await this.prisma.fs_shared_links.update({
              where: {
                id_fs_shared_link: folder.shared_link,
              },
              data: {
                id_fs_folder: folder_id,
              },
            });
          } else {
            await this.registry
              .getService('filestorage', 'sharedlink')
              .saveToDb(
                connection_id,
                linkedUserId,
                [folder.shared_link],
                originSource,
                [folder.shared_link].map(
                  (att: UnifiedFilestorageSharedlinkOutput) => att.remote_data,
                ),
                {
                  extra: {
                    object_name: 'folder',
                    value: folder_id,
                  },
                },
              );
          }
        }

        if (folder.permissions?.length > 0) {
          let permission_ids;
          if (typeof folder.permissions[0] === 'string') {
            permission_ids = folder.permissions;
          } else {
            const perms = await this.registry
              .getService('filestorage', 'permission')
              .saveToDb(
                connection_id,
                linkedUserId,
                folder.permissions as UnifiedFilestoragePermissionOutput[],
                originSource,
                (
                  folder.permissions as UnifiedFilestoragePermissionOutput[]
                ).map((att) => att.remote_data),
                { object_name: 'folder', value: folder_id },
              );
            permission_ids = perms.map(
              (att: FileStoragePermission) => att.id_fs_permission,
            );
          }
          await this.prisma.fs_folders.update({
            where: {
              id_fs_folder: folder_id,
            },
            data: {
              id_fs_permissions: permission_ids,
            },
          });
        }

        // Process field mappings
        await this.ingestService.processFieldMappings(
          folder.field_mappings,
          folder_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(folder_id, remote_data[i]);
      }
      return folders_results;
    } catch (error) {
      throw error;
    }
  }
}
