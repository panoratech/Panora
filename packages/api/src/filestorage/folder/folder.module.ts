import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { FolderService } from './services/folder.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { ConnectionUtils } from '@@core/connections/@utils';
import { BoxService } from './services/box';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [FolderController],
  providers: [
    FolderService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class FolderModule {}
