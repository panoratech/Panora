import { Module } from '@nestjs/common';
import { SyncContactsService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskContactService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ContactServiceRegistry } from './services/registry.service';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';

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
    ZendeskContactService,
    SyncContactsService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ContactServiceRegistry,
  ],
  exports: [SyncContactsService],
})
export class ContactModule {}
