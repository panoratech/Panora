import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedFilestoragePermissionOutput } from '@filestorage/permission/types/model.unified';
import { UnifiedFilestorageSharedlinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_files as FileStorageFile } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFileService } from '../types';
import { UnifiedFilestorageFileOutput } from '../types/model.unified';
import { fs_permissions as FileStoragePermission } from '@prisma/client';

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
    this.registry.registerService('filestorage', 'file', this);
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

  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_folder } = data;
      const service: IFileService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFilestorageFileOutput,
        OriginalFileOutput,
        IFileService
      >(integrationId, linkedUserId, 'filestorage', 'file', service, [
        {
          paramName: 'id_folder',
          param: id_folder,
          shouldPassToIngest: true,
          shouldPassToService: true,
        },
      ]);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    files: UnifiedFilestorageFileOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_folder?: string,
  ): Promise<FileStorageFile[]> {
    try {
      const files_results: FileStorageFile[] = [];
      // Cache for folder and drive lookups
      const folderLookupCache = new Map<string, string | null>();
      const driveLookupCache = new Map<string, string | null>();

      const updateOrCreateFile = async (
        file: UnifiedFilestorageFileOutput,
        originId: string,
        id_folder?: string,
      ) => {
        const existingFile = await this.prisma.fs_files.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let folder_id_by_remote_folder_id = null;
        let drive_id_by_remote_drive_id = null;

        if (file.remote_folder_id) {
          if (folderLookupCache.has(file.remote_folder_id)) {
            folder_id_by_remote_folder_id = folderLookupCache.get(
              file.remote_folder_id,
            );
          } else {
            const folder = await this.prisma.fs_folders.findFirst({
              where: {
                remote_id: file.remote_folder_id,
                id_connection: connection_id,
              },
              select: {
                id_fs_folder: true,
              },
            });
            folder_id_by_remote_folder_id = folder?.id_fs_folder ?? null;
            folderLookupCache.set(
              file.remote_folder_id,
              folder_id_by_remote_folder_id,
            );
          }
        }

        if (file.remote_drive_id) {
          if (driveLookupCache.has(file.remote_drive_id)) {
            drive_id_by_remote_drive_id = driveLookupCache.get(
              file.remote_drive_id,
            );
          } else {
            const drive = await this.prisma.fs_drives.findFirst({
              where: {
                remote_id: file.remote_drive_id,
                id_connection: connection_id,
              },
              select: {
                id_fs_drive: true,
              },
            });
            drive_id_by_remote_drive_id = drive?.id_fs_drive ?? null;
            driveLookupCache.set(
              file.remote_drive_id,
              drive_id_by_remote_drive_id,
            );
          }
        }

        const baseData: any = {
          name: file.name ?? null,
          file_url: file.file_url ?? null,
          mime_type: file.mime_type ?? null,
          size: file.size ?? null,
          id_fs_folder: id_folder ?? folder_id_by_remote_folder_id ?? null,
          id_fs_drive: drive_id_by_remote_drive_id ?? null,
          modified_at: new Date(),
          remote_created_at: file.remote_created_at ?? null,
          remote_modified_at: file.remote_modified_at ?? null,
          remote_was_deleted: file.remote_was_deleted ?? false,
        };

        // remove null values
        const cleanData = Object.fromEntries(
          Object.entries(baseData).filter(([_, value]) => value !== null),
        );

        if (existingFile) {
          return await this.prisma.fs_files.update({
            where: {
              id_fs_file: existingFile.id_fs_file,
            },
            data: cleanData,
          });
        } else {
          return await this.prisma.fs_files.create({
            data: {
              ...baseData,
              id_fs_file: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originId = file.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateFile(file, originId, id_folder);
        const file_id = res.id_fs_file;
        files_results.push(res);

        if (file.shared_link) {
          if (typeof file.shared_link === 'string') {
            await this.prisma.fs_shared_links.update({
              where: {
                id_fs_shared_link: file.shared_link,
              },
              data: {
                id_fs_folder: file_id,
              },
            });
          } else {
            await this.registry
              .getService('filestorage', 'sharedlink')
              .saveToDb(
                connection_id,
                linkedUserId,
                [file.shared_link],
                originSource,
                [file.shared_link].map(
                  (att: UnifiedFilestorageSharedlinkOutput) => att.remote_data,
                ),
                {
                  extra: {
                    object_name: 'file',
                    value: file_id,
                  },
                },
              );
          }
        }

        if (file.permissions?.length > 0) {
          let permission_ids;
          if (typeof file.permissions[0] === 'string') {
            permission_ids = file.permissions;
          } else {
            const perms = await this.registry
              .getService('filestorage', 'permission')
              .saveToDb(
                connection_id,
                linkedUserId,
                file.permissions as UnifiedFilestoragePermissionOutput[],
                originSource,
                (file.permissions as UnifiedFilestoragePermissionOutput[]).map(
                  (att) => att.remote_data,
                ),
                { object_name: 'file', value: file_id },
              );
            permission_ids = perms.map(
              (att: FileStoragePermission) => att.id_fs_permission,
            );
          }

          await this.prisma.fs_files.update({
            where: {
              id_fs_file: file_id,
            },
            data: {
              id_fs_permissions: permission_ids,
            },
          });
        }

        // Process field mappings
        await this.ingestService.processFieldMappings(
          file.field_mappings,
          file_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(file_id, remote_data[i]);
      }
      return files_results;
    } catch (error) {
      throw error;
    }
  }
}
