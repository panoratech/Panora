import { Module } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from '@@core/prisma/prisma.service';
import { FreshSalesService } from './services/freshsales';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { PipedriveService } from './services/pipedrive';
import { HubspotService } from './services/hubspot';
import { LoggerService } from '@@core/logger/logger.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { SyncContactsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { EncryptionService } from '@@core/encryption/encryption.service';

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
    FreshSalesService,
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    LoggerService,
    FieldMappingService,
    SyncContactsService,
    WebhookService,
    EncryptionService,
  ],
  exports: [SyncContactsService],
})
export class ContactModule {}
