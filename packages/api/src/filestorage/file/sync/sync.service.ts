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
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_files as FileStorageFile } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFileService } from '../types';
import { UnifiedFileOutput } from '../types/model.unified';
import { UnifiedSharedLinkOutput } from '@filestorage/sharedlink/types/model.unified';
import { UnifiedPermissionOutput } from '@filestorage/permission/types/model.unified';

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

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-files',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async kickstartSync(user_id?: string) {
    try {
      this.logger.log('Syncing files...');
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
                    const connection = await this.prisma.connections.findFirst({
                      where: {
                        id_linked_user: linkedUser.id_linked_user,
                        provider_slug: provider.toLowerCase(),
                      },
                    });
                    //call the sync files for every folder of the linkedUser (a file might be tied to a folder)
                    const folders = await this.prisma.fs_folders.findMany({
                      where: {
                        id_connection: connection.id_connection,
                      },
                    });
                    for (const folder of folders) {
                      await this.syncForLinkedUser({
                        integrationId: provider,
                        linkedUserId: linkedUser.id_linked_user,
                        folder_id: folder.id_fs_folder,
                      });
                    }
                    // do a batch sync without folders as some providers might accept it
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

  async syncForLinkedUser(data: SyncLinkedUserType) {
    try {
      const { integrationId, linkedUserId, id_folder } = data;
      const service: IFileService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedFileOutput,
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
    files: UnifiedFileOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    id_folder?: string,
  ): Promise<FileStorageFile[]> {
    try {
      const files_results: FileStorageFile[] = [];

      const updateOrCreateFile = async (
        file: UnifiedFileOutput,
        originId: string,
        id_folder?: string,
      ) => {
        const existingFile = await this.prisma.fs_files.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const baseData: any = {
          name: file.name ?? null,
          file_url: file.file_url ?? null,
          mime_type: file.mime_type ?? null,
          size: file.size ?? null,
          id_fs_folder: id_folder ?? null,
          modified_at: new Date(),
        };

        if (existingFile) {
          return await this.prisma.fs_files.update({
            where: {
              id_fs_file: existingFile.id_fs_file,
            },
            data: baseData,
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
                  (att: UnifiedSharedLinkOutput) => att.remote_data,
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

        if (file.permission) {
          let permission_id;
          if (typeof file.permission === 'string') {
            permission_id = file.permission;
          } else {
            const perms = await this.registry
              .getService('filestorage', 'permission')
              .saveToDb(
                connection_id,
                linkedUserId,
                [file.permission],
                originSource,
                [file.permission].map(
                  (att: UnifiedPermissionOutput) => att.remote_data,
                ),
                { object_name: 'file', value: file_id },
              );
            permission_id = perms[0].id_fs_permission;
          }
          await this.prisma.fs_files.update({
            where: {
              id_fs_file: file_id,
            },
            data: {
              id_fs_permission: permission_id,
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
