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
import { fs_shared_links as FileStorageSharedLink } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { UnifiedSharedLinkOutput } from '../types/model.unified';

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
  // syncs are performed within File/Folder objects so its not useful to do it here
  onModuleInit() {
    return;
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    sharedLinks: UnifiedSharedLinkOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    extra?: {
      object_name: 'file' | 'folder';
      value: string;
    },
  ): Promise<FileStorageSharedLink[]> {
    try {
      let shared_links_results: FileStorageSharedLink[] = [];
      for (let i = 0; i < sharedLinks.length; i++) {
        const sharedLink = sharedLinks[i];
        const originId = sharedLink.remote_id;

        let existingSl;
        if (!originId) {
          existingSl = await this.prisma.fs_shared_links.findFirst({
            where: {
              url: sharedLink.url,
              id_connection: connection_id,
            },
          });
        } else {
          existingSl = await this.prisma.fs_shared_links.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        let unique_fs_shared_link_id: string;
        if (existingSl) {
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
              id_fs_shared_link: existingSl.id_fs_shared_link,
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
