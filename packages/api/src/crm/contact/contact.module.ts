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
import { SyncContactsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [ContactController],
  providers: [
    ContactService,
    PrismaService,
    LoggerService,
    FieldMappingService,
    SyncContactsService,
    WebhookService,
    EncryptionService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    AttioService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
  ],
  exports: [SyncContactsService],
})
export class ContactModule {}
