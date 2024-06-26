import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreModule } from '@@core/core.module';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './services/message.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
    CoreModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService, CoreModule],
})
export class MessageModule {}
