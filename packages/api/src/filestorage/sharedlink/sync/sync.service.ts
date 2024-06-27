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
import { ISharedLinkService } from '../types';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { UnifiedSharedLinkOutput } from '../types/model.unified';
import { fs_shared_links as FileStorageSharedLink } from '@prisma/client';
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
    this.registry.registerService('filestorage', 'sharedlink', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'filestorage-sync-sharedlinks',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  @Cron('0 */8 * * *') // every 8 hours
  async syncSharedLinks(user_id?: string) {
    try {
      this.logger.log('Syncing shared links...');
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
                    //call the sync comments for every ticket of the linkedUser (a comment is tied to a ticket)
                    const folders = await this.prisma.fs_folders.findMany({
                      where: {
                        id_connection: connection.id_connection,
                      },
                    });
                    const files = await this.prisma.fs_files.findMany({
                      where: {
                        id_connection: connection.id_connection,
                      },
                    });
                    for (const folder of folders) {
                      await this.syncSharedLinksForLinkedUser(
                        provider,
                        linkedUser.id_linked_user,
                        folder.id_fs_folder,
                      );
                    }
                    for (const file of files) {
                      await this.syncSharedLinksForLinkedUser(
                        provider,
                        linkedUser.id_linked_user,
                        file.id_fs_file,
                      );
                    }
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

  async syncSharedLinksForLinkedUser(
    integrationId: string,
    linkedUserId: string,
    folder_or_file_id?: string,
  ) {
    try {
      this.logger.log(
        `Syncing ${integrationId} shared links for linkedUser ${linkedUserId}`,
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
          `Skipping shared links syncing... No ${integrationId} connection was found for linked user ${linkedUserId} `,
        );
        return;
      }
      // get potential fieldMappings and extract the original properties name
      const customFieldMappings =
        await this.fieldMappingService.getCustomFieldMappings(
          integrationId,
          linkedUserId,
          'filestorage.shared_link',
        );
      const remoteProperties: string[] = customFieldMappings.map(
        (mapping) => mapping.remote_id,
      );

      const service: ISharedLinkService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;
      const resp: ApiResponse<OriginalSharedLinkOutput[]> =
        await service.syncSharedLinks(
          linkedUserId,
          folder_or_file_id,
          remoteProperties,
        );

      const sourceObject: OriginalSharedLinkOutput[] = resp.data;

      await this.ingestService.ingestData<
        UnifiedSharedLinkOutput,
        OriginalSharedLinkOutput
      >(
        sourceObject,
        integrationId,
        connection.id_connection,
        'filestorage',
        'sharedlink',
        customFieldMappings,
        { file_or_folder_id: folder_or_file_id },
      );
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    sharedLinks: UnifiedSharedLinkOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    file_or_folder_id: string,
  ): Promise<FileStorageSharedLink[]> {
    try {
      //TODO
      let shared_links_results: FileStorageSharedLink[] = [];
      for (let i = 0; i < sharedLinks.length; i++) {
        const sharedLink = sharedLinks[i];
        //const originId = sharedLink.remote_id;
        const index = file_or_folder_id;
        if (!index || index === '') {
          throw new ReferenceError(`Origin id not there, found ${index}`);
        }
        const a = await this.prisma.fs_files.findUnique({
          where: {
            id_fs_file: file_or_folder_id,
          },
        });
        const b = await this.prisma.fs_folders.findUnique({
          where: {
            id_fs_folder: file_or_folder_id,
          },
        });
        let existingSharedLink;
        if (a) {
          existingSharedLink = await this.prisma.fs_shared_links.findFirst({
            where: {
              id_fs_file: file_or_folder_id,
              id_connection: connection_id,
            },
          });
        } else {
          if (b) {
            existingSharedLink = await this.prisma.fs_shared_links.findFirst({
              where: {
                id_fs_folder: file_or_folder_id,
                id_connection: connection_id,
              },
            });
          }
        }

        let unique_fs_shared_link_id: string;

        if (existingSharedLink) {
          // Update the existing shared link
          let data: any = {
            modified_at: new Date(),
          };
          if (sharedLink.url) {
            data = { ...data, url: sharedLink.url };
          }
          if (sharedLink.download_url) {
            data = { ...data, download_url: sharedLink.download_url };
          }
          if (b) {
            data = {
              ...data,
              folder_id: sharedLink.folder_id || file_or_folder_id,
            };
          }
          if (a) {
            data = {
              ...data,
              file_id: sharedLink.file_id || file_or_folder_id,
            };
          }

          if (sharedLink.scope) {
            data = { ...data, scope: sharedLink.scope };
          }
          if (sharedLink.password_protected) {
            data = {
              ...data,
              password_protected: sharedLink.password_protected,
            };
          }
          if (sharedLink.password) {
            data = { ...data, password: sharedLink.password };
          }
          const res = await this.prisma.fs_shared_links.update({
            where: {
              id_fs_shared_link: existingSharedLink.id_fs_shared_link,
            },
            data: data,
          });
          unique_fs_shared_link_id = res.id_fs_shared_link;
          shared_links_results = [...shared_links_results, res];
        } else {
          // Create a new shared link
          this.logger.log('Shared link does not exist, creating a new one');
          const uuid = uuidv4();
          let data: any = {
            id_fs_shared_link: uuid,
            created_at: new Date(),
            modified_at: new Date(),
            id_connection: connection_id,
          };

          if (sharedLink.url) {
            data = { ...data, url: sharedLink.url };
          }
          if (sharedLink.download_url) {
            data = { ...data, download_url: sharedLink.download_url };
          }
          if (sharedLink.folder_id) {
            data = {
              ...data,
              folder_id: sharedLink.folder_id || file_or_folder_id,
            };
          }
          if (sharedLink.file_id) {
            data = {
              ...data,
              file_id: sharedLink.file_id || file_or_folder_id,
            };
          }
          if (sharedLink.scope) {
            data = { ...data, scope: sharedLink.scope };
          }
          if (sharedLink.password_protected) {
            data = {
              ...data,
              password_protected: sharedLink.password_protected,
            };
          }
          if (sharedLink.password) {
            data = { ...data, password: sharedLink.password };
          }

          const newSharedLink = await this.prisma.fs_shared_links.create({
            data: data,
          });

          unique_fs_shared_link_id = newSharedLink.id_fs_shared_link;
          shared_links_results = [...shared_links_results, newSharedLink];
        }

        // check duplicate or existing values
        if (sharedLink.field_mappings && sharedLink.field_mappings.length > 0) {
          const entity = await this.prisma.entity.create({
            data: {
              id_entity: uuidv4(),
              ressource_owner_id: unique_fs_shared_link_id,
            },
          });

          for (const [slug, value] of Object.entries(
            sharedLink.field_mappings,
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
            ressource_owner_id: unique_fs_shared_link_id,
          },
          create: {
            id_remote_data: uuidv4(),
            ressource_owner_id: unique_fs_shared_link_id,
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
      return shared_links_results;
    } catch (error) {
      throw error;
    }
  }
}
