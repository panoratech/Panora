import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { CloseService } from './services/close';
import { CloseTaskMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { HubspotTaskMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveTaskMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { TaskService } from './services/task.service';
import { ZendeskService } from './services/zendesk';
import { AttioService } from './services/attio';
import { ZendeskTaskMapper } from './services/zendesk/mappers';
import { AttioTaskMapper } from './services/attio/mappers';
import { ZohoService } from './services/zoho';
import { ZohoTaskMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { TaskController } from './task.controller';
@Module({
  imports: [BullQueueModule],
  controllers: [TaskController],
  providers: [
    TaskService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    ZohoService,
    PipedriveService,
    HubspotService,
    AttioService,
    CloseService,
    /* PROVIDERS MAPPERS */
    ZendeskTaskMapper,
    ZohoTaskMapper,
    PipedriveTaskMapper,
    HubspotTaskMapper,
    CloseTaskMapper,
    AttioTaskMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class TaskModule {}
