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
import { IAttachmentService } from '../types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedAttachmentOutput } from '../types/model.unified';
import { ats_candidate_attachments as AtsAttachment } from '@prisma/client';
import { ATS_PROVIDERS } from '@panora/shared';
import { AtsObject } from '@ats/@lib/@types';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
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
    this.registry.registerService('ats', 'attachment', this);
  }

  async onModuleInit() {
    try {
      await this.bullQueueService.queueSyncJob(
        'ats-sync-attachments',
        '0 0 * * *',
      );
    } catch (error) {
      throw error;
    }
  }

  // it is synced within candidate sync

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    attachments: UnifiedAttachmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    candidate_id?: string,
  ): Promise<AtsAttachment[]> {
    try {
      const attachments_results: AtsAttachment[] = [];

      const updateOrCreateAttachment = async (
        attachment: UnifiedAttachmentOutput,
        originId: string,
      ) => {
        let existingAttachment;
        if (!originId) {
          existingAttachment =
            await this.prisma.ats_candidate_attachments.findFirst({
              where: {
                file_name: attachment.file_name ?? null,
                file_url: attachment.file_url ?? null,
                id_connection: connection_id,
              },
            });
        } else {
          existingAttachment =
            await this.prisma.ats_candidate_attachments.findFirst({
              where: {
                remote_id: originId,
                id_connection: connection_id,
              },
            });
        }

        const baseData: any = {
          file_url: attachment.file_url ?? null,
          file_name: attachment.file_name ?? null,
          file_type: attachment.attachment_type ?? null,
          remote_created_at: attachment.remote_created_at ?? null,
          remote_modified_at: attachment.remote_modified_at ?? null,
          candidate_id: candidate_id ?? null,
          modified_at: new Date(),
        };

        let res;
        if (existingAttachment) {
          res = await this.prisma.ats_candidate_attachments.update({
            where: {
              id_ats_candidate_attachment:
                existingAttachment.id_ats_candidate_attachment,
            },
            data: baseData,
          });
        } else {
          res = await this.prisma.ats_candidate_attachments.create({
            data: {
              ...baseData,
              id_ats_attachment: uuidv4(),
              created_at: new Date(),
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        return res;
      };

      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        const originId = attachment.remote_id;

        if (!originId || originId === '') {
          throw new ReferenceError(`Origin id not there, found ${originId}`);
        }

        const res = await updateOrCreateAttachment(attachment, originId);
        const attachment_id = res.id_ats_attachment;
        attachments_results.push(res);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          attachment.field_mappings,
          attachment_id,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          attachment_id,
          remote_data[i],
        );
      }

      return attachments_results;
    } catch (error) {
      throw error;
    }
  }
}
