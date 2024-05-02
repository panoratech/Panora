import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { TaskService } from './services/task.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
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
export class TaskModule {}
