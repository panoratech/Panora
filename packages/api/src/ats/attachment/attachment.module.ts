import { Module } from '@nestjs/common';
import { AttachmentController } from './attachment.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { AttachmentService } from './services/attachment.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';

@Module({
  controllers: [AttachmentController],
  providers: [
    AttachmentService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class AttachmentModule {}
