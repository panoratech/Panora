import { Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { EngagementService } from './services/engagement.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { FreshsalesService } from './services/freshsales';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [EngagementController],
  providers: [
    EngagementService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    FreshsalesService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
  ],
  exports: [SyncService],
})
export class EngagementModule {}
