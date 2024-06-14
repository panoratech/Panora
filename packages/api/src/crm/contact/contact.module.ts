import { AffinityService } from './services/affinity';
import { Module } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { AttioService } from './services/attio';
import { ZohoService } from './services/zoho';
import { PipedriveService } from './services/pipedrive';
import { HubspotService } from './services/hubspot';
import { LoggerService } from '@@core/logger/logger.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';
import { CloseService } from './services/close';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,
    PrismaService,
    LoggerService,
    FieldMappingService,
    SyncService,
    WebhookService,
    EncryptionService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    AttioService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
    AffinityService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
    PrismaService,
  ],
})
export class ContactModule {}
