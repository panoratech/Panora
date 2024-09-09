import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { UnifiedAccountingAttachmentOutput } from '../types/model.unified';
import { IAttachmentService } from '../types';
import { IBaseSync, SyncLinkedUserType } from '@@core/utils/types/interface';
import { ACCOUNTING_PROVIDERS } from '@panora/shared';
import { acc_attachments as AccAttachment } from '@prisma/client';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.accounting';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

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
    private ingestService: IngestDataService,
  ) {
    this.logger.setContext(SyncService.name);
    this.registry.registerService('accounting', 'attachment', this);
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
          const providers = ACCOUNTING_PROVIDERS;
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
      const service: IAttachmentService =
        this.serviceRegistry.getService(integrationId);
      if (!service) return;

      await this.ingestService.syncForLinkedUser<
        UnifiedAccountingAttachmentOutput,
        OriginalAttachmentOutput,
        IAttachmentService
      >(integrationId, linkedUserId, 'accounting', 'attachment', service, []);
    } catch (error) {
      throw error;
    }
  }

  async saveToDb(
    connection_id: string,
    linkedUserId: string,
    attachments: UnifiedAccountingAttachmentOutput[],
    originSource: string,
    remote_data: Record<string, any>[],
  ): Promise<AccAttachment[]> {
    try {
      const attachmentResults: AccAttachment[] = [];

      for (let i = 0; i < attachments.length; i++) {
        const attachment = attachments[i];
        const originId = attachment.remote_id;

        let existingAttachment = await this.prisma.acc_attachments.findFirst({
          where: {
            remote_id: originId,
            id_connection: connection_id,
          },
        });

        const attachmentData = {
          file_name: attachment.file_name,
          file_url: attachment.file_url,
          id_acc_account: attachment.account_id,
          remote_id: originId,
          modified_at: new Date(),
        };

        if (existingAttachment) {
          existingAttachment = await this.prisma.acc_attachments.update({
            where: { id_acc_attachment: existingAttachment.id_acc_attachment },
            data: attachmentData,
          });
        } else {
          existingAttachment = await this.prisma.acc_attachments.create({
            data: {
              ...attachmentData,
              id_acc_attachment: uuidv4(),
              created_at: new Date(),
              id_connection: connection_id,
            },
          });
        }

        attachmentResults.push(existingAttachment);

        // Process field mappings
        await this.ingestService.processFieldMappings(
          attachment.field_mappings,
          existingAttachment.id_acc_attachment,
          originSource,
          linkedUserId,
        );

        // Process remote data
        await this.ingestService.processRemoteData(
          existingAttachment.id_acc_attachment,
          remote_data[i],
        );
      }

      return attachmentResults;
    } catch (error) {
      throw error;
    }
  }

  async removeInDb(connection_id: string, remote_id: string): Promise<void> {
    try {
      await this.prisma.acc_attachments.deleteMany({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
