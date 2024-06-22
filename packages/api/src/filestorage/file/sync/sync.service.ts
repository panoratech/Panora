import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { CoreUnification } from '@@core/utils/services/core.service';
import { ApiResponse } from '@@core/utils/types';
import { IFileService } from '../types';
import { OriginalFileOutput } from '@@core/utils/types/original/original.filestorage';
import { UnifiedFileOutput } from '../types/model.unified';
import { fs_files as FileStorageFile } from '@prisma/client';
import { FILESTORAGE_PROVIDERS } from '@panora/shared';
import { FileStorageObject } from '@filestorage/@lib/@types';

@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
    private coreUnification: CoreUnification,
    @InjectQueue('syncTasks') private syncQueue: Queue,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    try {
      await this.scheduleSyncJob();
    } catch (error) {
      throw error;
    }
  }

  private async scheduleSyncJob() {
    const jobName = 'filestorage-sync-files';

    // Remove existing jobs to avoid duplicates in case of application restart
    const jobs = await this.syncQueue.getRepeatableJobs();
    for (const job of jobs) {
      if (job.name === jobName) {
        await this.syncQueue.removeRepeatableByKey(job.key);
      }
    }
    // Add new job to the queue with a CRON expression
    await this.syncQueue.add(
      jobName,
      {},
      {
        repeat: { cron: '0 0 * * *' }, // Runs once a day at midnight
      },
    );
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncFiles(user_id?: string) {
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
                    await this.syncFilesForLinkedUser(
                      provider,
                      linkedUser.id_linked_user,
                      id_project,
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

  async syncFilesForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    id_project: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} files for linkedUser ${linkedUserId}`,
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
          `Skipping files syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.file',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: IFileService =
        this.serviceRegistry.getService(integrationId);
      const resp: ApiResponse<OriginalFileOutput[]> = await service.syncFiles(
        linkedUserId,
        remoteProperties,
      );

      const sourceObject: OriginalFileOutput[] = resp.data;

      // unify the data according to the target obj wanted
      const unifiedObject = (await this.coreUnification.unify<
        OriginalFileOutput[]
      >({
        sourceObject,
        targetType: FileStorageObject.file,
        providerName: integrationId,
        vertical: 'filestorage',
        customFieldMappings,
      })) as UnifiedFileOutput[];

      // insert the data in the DB with the fieldMappings (value table)
      const files_data = await this.saveFilesInDb(
        linkedUserId,
        unifiedObject,
        integrationId,
        sourceObject,
      );
      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.file.pulled',
          method: 'PULL',
          url: '/pull',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        files_data,
        'filestorage.file.pulled',
        id_project,
        event.id_event,
      );
    } catch (error) {
      throw error;
    }
  }

  async saveFilesInDb(
    linkedUserId: string,
    files: UnifiedFileOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<FileStorageFile[]> {
    try {
      let files_results: FileStorageFile[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originId = file.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const existingFile = await this.prisma.fs_files.findFirst({
          where: {
            remote_id: originId,
            remote_platform: originSource,
            id_linked_user: linkedUserId,
          },
        });

        let unique_fs_file_id: string;

        if (existingFile) {
          // Update the existing file
          let data: any = {
            modified_at: new Date(),
          };
          if (file.name) {
            data = { ...data, name: file.name };
          }
          if (file.type) {
            data = { ...data, type: file.type };
          }
          if (file.file_url) {
            data = { ...data, file_url: file.file_url };
          }
          if (file.mime_type) {
            data = { ...data, mime_type: file.mime_type };
          }
          if (file.size) {
            data = { ...data, size: file.size };
          }
          if (file.folder_id) {
            data = { ...data, folder_id: file.folder_id };
          }
          if (file.permission_id) {
            data = { ...data, permission_id: file.permission_id };
          }
          const res = await this.prisma.fs_files.update({
            where: {
              id_fs_file: existingFile.id_fs_file,
            },
            data: data,
          });
          unique_fs_file_id = res.id_fs_file;
          files_results = [...files_results, res];
        } else {
          // Create a new file
          this.logger.log('File does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_file: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_linked_user: linkedUserId,
            remote_id: originId,
            remote_platform: originSource,
          };

          if (file.name) {
            data = { ...data, name: file.name };
          }
          if (file.type) {
            data = { ...data, type: file.type };
          }
          if (file.file_url) {
            data = { ...data, file_url: file.file_url };
          }
          if (file.mime_type) {
            data = { ...data, mime_type: file.mime_type };
          }
          if (file.size) {
            data = { ...data, size: file.size };
          }
          if (file.folder_id) {
            data = { ...data, folder_id: file.folder_id };
          }
          if (file.permission_id) {
            data = { ...data, permission_id: file.permission_id };
          }

          const newFile = await this.prisma.fs_files.create({
            data: data,
          });

          unique_fs_file_id = newFile.id_fs_file;
          files_results = [...files_results, newFile];
        }

        // check duplicate or existing values
        if (file.field_mappings && file.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_file_id,
            },
          });

          for (const [slug, value] of Object.entries(file.field_mappings)) {
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
            ressource_owner_id: unique_fs_file_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_file_id,
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
      return files_results;
    } catch (error) {
      throw error;
    }
  }
}
