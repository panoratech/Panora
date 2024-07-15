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
import { UnifiedFolderOutput } from '../types/model.unified';
import { UnifiedSharedLinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';

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

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-folders',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing folders...');
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
          }
        }
      }
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
        UnifiedFolderOutput,
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
    folders: UnifiedFolderOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageFolder[]> {
    try {
      const folders_results: FileStorageFolder[] = [];

      const updateOrCreateFolder = async (
        folder: UnifiedFolderOutput,
        originId: string,
      ) => {
        const existingFolder = await this.prisma.fs_folders.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: folder.name ?? null,
          size: folder.size ?? null,
          folder_url: folder.folder_url ?? null,
          description: folder.description ?? null,
          id_fs_drive: folder.drive_id ?? null,
          parent_folder: folder.parent_folder_id ?? null,
          modified_at: new Date(),
        };

        if (existingFolder) {
          return await this.prisma.fs_folders.update({
            where: {
              id_fs_folder: existingFolder.id_fs_folder,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_folders.create({
            data: {
              ...baseData,
              id_fs_folder: uuidv4(),
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
                  (att: UnifiedSharedLinkOutput) => att.remote_data,
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

        if (folder.permission) {
          let permission_id;
          if (typeof folder.permission === 'string') {
            permission_id = folder.permission;
          } else {
            const perms = await this.registry
              .getService('filestorage', 'permission')
              .saveToDb(
                connection_id,
                linkedUserId,
                [folder.permission],
                originSource,
                [folder.permission].map(
                  (att: UnifiedPermissionOutput) => att.remote_data,
                ),
                { object_name: 'folder', value: folder_id },
              );
            permission_id = perms[0].id_fs_permission;
          }
          await this.prisma.fs_folders.update({
            where: {
              id_fs_folder: folder_id,
            },
            data: {
              id_fs_permission: permission_id,
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
