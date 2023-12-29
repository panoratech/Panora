import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { SyncAttachmentsService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ZendeskAttachmentService } from './services/zendesk';
import { AttachmentService } from './services/attachment.service';
import { AttachmentServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [AttachmentController],
  providers: [
    AttachmentService,
    PrismaService,
    ZendeskAttachmentService,
    LoggerService,
    SyncAttachmentsService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    AttachmentServiceRegistry,
  ],
  exports: [SyncAttachmentsService],
})
export class AttachmentModule {}
