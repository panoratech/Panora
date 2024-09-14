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
import { UnifiedFilestorageSharedlinkOutput } from '../types/model.unified';

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

  async kickstartSync(id_project?: string) {
    return;
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    sharedLinks: UnifiedFilestorageSharedlinkOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    extra?: {
      object_name: 'file' | 'folder';
      value: string;
    },
  ): Promise<FileStorageSharedLink[]> {
    try {
      const shared_links_results: FileStorageSharedLink[] = [];

      const updateOrCreateSharedLink = async (
        sharedLink: UnifiedFilestorageSharedlinkOutput,
        originId: string,
      ) => {
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

        const baseData: any = {
          url: sharedLink.url ?? null,
          download_url: sharedLink.download_url ?? null,
          scope: sharedLink.scope ?? null,
          password_protected: sharedLink.password_protected ?? null,
          password: sharedLink.password ?? null,
          modified_at: new Date(),
        };

        if (extra && extra.object_name == 'file') {
          baseData.id_fs_file = extra.value;
        }

        if (extra && extra.object_name == 'folder') {
          baseData.id_fs_folder = extra.value;
        }

        if (existingSl) {
          return await this.prisma.fs_shared_links.update({
            where: {
              id_fs_shared_link: existingSl.id_fs_shared_link,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.fs_shared_links.create({
            data: {
              ...baseData,
              id_fs_shared_link: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < sharedLinks.length; i++) {
        const sharedLink = sharedLinks[i];
        const originId = sharedLink.remote_id;

        const res = await updateOrCreateSharedLink(sharedLink, originId);
        const shared_link_id = res.id_fs_shared_link;
        shared_links_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          sharedLink.field_mappings,
          shared_link_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          shared_link_id,
          remote_data[i],
        );
      }
      return shared_links_results;
    } catch (error) {
      throw error;
    }
  }
}
