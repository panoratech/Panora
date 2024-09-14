import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { IBaseSync } from '@@core/utils/types/interface';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { tcg_attachments as TicketingAttachment } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedTicketingAttachmentOutput } from '../types/model.unified';

@Injectable()
export class SyncService implements OnModuleInit, IBaseSync {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private registry: CoreSyncRegistry,
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('ticketing', 'attachment', this);
  }
  onModuleInit() {
    //
  }

  // we don't sync here as it is done within the Comment & Ticket Sync services
  // we only save to the db

  async kickstartSync(id_project?: string) {
    return;
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    data: UnifiedTicketingAttachmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
    extra: {
      object_name: 'ticket' | 'comment';
      value: string;
    },
  ): Promise<TicketingAttachment[]> {
    try {
      const attachments_results: TicketingAttachment[] = [];

      const updateOrCreateAttachment = async (
        attachment: UnifiedTicketingAttachmentOutput,
        originId: string,
        connection_id: string,
      ) => {
        let existingAttachment;
        if (!originId) {
          existingAttachment = await this.prisma.tcg_attachments.findFirst({
            where: {
              file_name: attachment.file_name ?? null,
              file_url: attachment.file_url ?? null,
              id_connection: connection_id,
            },
          });
        } else {
          existingAttachment = await this.prisma.tcg_attachments.findFirst({
            where: {
              remote_id: originId,
              id_connection: connection_id,
            },
          });
        }

        const baseData: any = {
          file_name: attachment.file_name ?? null,
          file_url: attachment.file_url ?? null,
          uploader: attachment.uploader ?? null,
          modified_at: new Date(),
        };

        if (extra.object_name === 'ticket') {
          baseData.id_tcg_ticket = extra.value;
        }
        if (extra.object_name === 'comment') {
          baseData.id_tcg_comment = extra.value;
        }

        if (existingAttachment) {
          return await this.prisma.tcg_attachments.update({
            where: {
              id_tcg_attachment: existingAttachment.id_tcg_attachment,
            },
            data: {
              ...baseData,
              id_tcg_attachment: existingAttachment.id_tcg_attachment,
            },
          });
        } else {
          return await this.prisma.tcg_attachments.create({
            data: {
              ...baseData,
              id_tcg_attachment: uuidv4(),
              created_at: new Date(),
              remote_id: originId ?? null,
              id_connection: connection_id,
            },
          });
        }
      };

      for (let i = 0; i < data.length; i++) {
        const attachment = data[i];
        const originId = attachment.remote_id;

        const res = await updateOrCreateAttachment(
          attachment,
          originId,
          connection_id,
        );
        const attachment_id = res.id_tcg_attachment;
        attachments_results.push(res);

        await this.ingestService.processFieldMappings(
          attachment.field_mappings,
          attachment_id,
          originSource,
          linkedUserId,
        );
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
