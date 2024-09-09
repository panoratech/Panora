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
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ATS_PROVIDERS, FILESTORAGE_PROVIDERS } from '@panora/shared';
import { ats_candidate_tags as AtsTag } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ServiceRegistry } from '../services/registry.service';
import { ITagService } from '../types';
import { UnifiedAtsTagOutput } from '../types/model.unified';

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
    this.registry.registerService('ats', 'tag', this);
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
          const providers = ATS_PROVIDERS;
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
      const service: ITagService =
        this.serviceRegistry.getService(integrationId);
      if (!service) {
        this.logger.log(
          `No service found in {vertical:ats, commonObject: tag} for integration ID: ${integrationId}`,
        );
        return;
      }

      await this.ingestService.syncForLinkedUser<
        UnifiedAtsTagOutput,
        OriginalTagOutput,
        ITagService
      >(integrationId, linkedUserId, 'ats', 'tag', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    tags: UnifiedAtsTagOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AtsTag[]> {
    try {
      const tags_results: AtsTag[] = [];

      const updateOrCreateTag = async (
        tag: UnifiedAtsTagOutput,
        originId: string,
      ) => {
        let existingTag;
        if (!originId) {
          existingTag = await this.prisma.ats_candidate_tags.findFirst({
            where: {
              name: tag.name,
            },
          });
        } else {
          existingTag = await this.prisma.ats_candidate_tags.findFirst({
            where: {
              remote_id: originId,
            },
          });
        }

        const baseData: any = {
          name: tag.name ?? null,
          modified_at: new Date(),
        };

        if (existingTag) {
          return await this.prisma.ats_candidate_tags.update({
            where: {
              id_ats_candidate_tag: existingTag.id_ats_candidate_tag,
            },
            data: baseData,
          });
        } else {
          return await this.prisma.ats_candidate_tags.create({
            data: {
              ...baseData,
              id_ats_candidate_tag: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
            },
          });
        }
      };

      for (let i = 0; i < tags.length; i++) {
        const tag = tags[i];
        const originId = tag.remote_id;

        const res = await updateOrCreateTag(tag, originId);
        const tag_id = res.id_ats_candidate_tag;
        tags_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          tag.field_mappings,
          tag_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(tag_id, remote_data[i]);
      }
      return tags_results;
    } catch (error) {
      throw error;
    }
  }
}
