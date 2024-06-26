import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ApiResponse } from '@@core/utils/types';
import { IBaseSync } from '@@core/utils/types/interface';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { fs_folders as FileStorageFolder } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { IFolderService } from '../types';
import { UnifiedFolderOutput } from '../types/model.unified';

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
  async syncFolders(user_id?: string) {
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
                    await this.syncFoldersForLinkedUser(
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

  async syncFoldersForLinkedUser(integrationId: string, linkedUserId: string) {
    try {
      this.logger.log(
        `Syncing ${integrationId} folders for linkedUser ${linkedUserId}`,
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
          `Skipping folders syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.folder',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IFolderService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalFolderOutput[]> =
        await service.syncFolders(linkedUserId, remoteProperties);
      if (!resp) return;

      const sourceObject: OriginalFolderOutput[] = resp.data;

      await this.ingestService.ingestData(
        sourceObject,
        integrationId,
        connection.id_connection,
        'filestorage',
        'folder',
        customFieldMappings,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedFolderOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageFolder[]> {
    try {
      let folders_results: FileStorageFolder[] = [];
      for (let i = 0; i < data.length; i++) {
        const folder = data[i];
        const originId = folder.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingFolder = await this.prisma.fs_folders.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        let unique_fs_folder_id: string;

        if (existingFolder) {
          // Update the existing folder
          let data: any = {
            modified_at: new Date(),
          };
          if (folder.name) {
            data = { ...data, name: folder.name };
          }
          if (folder.size) {
            data = { ...data, size: folder.size };
          }
          if (folder.folder_url) {
            data = { ...data, folder_url: folder.folder_url };
          }
          if (folder.description) {
            data = { ...data, description: folder.description };
          }
          if (folder.drive_id) {
            data = { ...data, drive_id: folder.drive_id };
          }
          if (folder.parent_folder_id) {
            data = { ...data, parent_folder_id: folder.parent_folder_id };
          }
          if (folder.permission_id) {
            data = { ...data, permission_id: folder.permission_id };
          }
          const res = await this.prisma.fs_folders.update({
            where: {
              id_fs_folder: existingFolder.id_fs_folder,
            },
            data: data,
          });
          unique_fs_folder_id = res.id_fs_folder;
          folders_results = [...folders_results, res];
        } else {
          // Create a new folder
          this.logger.log('Folder does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_folder: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            remote_id: originId,
            id_connection: connection_id,
          };

          if (folder.name) {
            data = { ...data, name: folder.name };
          }
          if (folder.size) {
            data = { ...data, size: folder.size };
          }
          if (folder.folder_url) {
            data = { ...data, folder_url: folder.folder_url };
          }
          if (folder.description) {
            data = { ...data, description: folder.description };
          }
          if (folder.drive_id) {
            data = { ...data, drive_id: folder.drive_id };
          }
          if (folder.parent_folder_id) {
            data = { ...data, parent_folder_id: folder.parent_folder_id };
          }
          if (folder.permission_id) {
            data = { ...data, permission_id: folder.permission_id };
          }

          const newFolder = await this.prisma.fs_folders.create({
            data: data,
          });

          unique_fs_folder_id = newFolder.id_fs_folder;
          folders_results = [...folders_results, newFolder];
        }

        // check duplicate or existing values
        if (folder.field_mappings && folder.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_folder_id,
            },
          });

          for (const [slug, value] of Object.entries(folder.field_mappings)) {
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
            ressource_owner_id: unique_fs_folder_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_folder_id,
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
      return folders_results;
    } catch (error) {
      throw error;
    }
  }
}
