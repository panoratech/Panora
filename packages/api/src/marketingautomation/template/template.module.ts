import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { CoreModule } from '@@core/core.module';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { TemplateService } from './services/template.service';
import { SyncService } from './sync/sync.service';
import { TemplateController } from './template.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
    CoreModule,
  ],
  controllers: [TemplateController],
  providers: [
    TemplateService,
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
export class TemplateModule {}
