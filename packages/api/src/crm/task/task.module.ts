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
import { ConnectionUtils } from '@@core/connections/@utils';
import { HubspotService } from './services/hubspot';
import { PipedriveService } from './services/pipedrive';
import { ZendeskService } from './services/zendesk';
import { ZohoService } from './services/zoho';
import { CloseService } from './services/close';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@crm/@lib/@utils';
import { CloseTaskMapper } from './services/close/mappers';
import { HubspotTaskMapper } from './services/hubspot/mappers';
import { PipedriveTaskMapper } from './services/pipedrive/mappers';
import { ZendeskTaskMapper } from './services/zendesk/mappers';
import { ZohoTaskMapper } from './services/zoho/mappers';


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

    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    // UnificationRegistry,
    // MappersRegistry,
    Utils,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
    /* PROVIDERS MAPPERS */
    ZendeskTaskMapper,
    ZohoTaskMapper,
    PipedriveTaskMapper,
    HubspotTaskMapper,
    CloseTaskMapper,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class TaskModule { }
