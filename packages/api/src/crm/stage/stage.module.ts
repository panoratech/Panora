import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { CloseService } from './services/close';
import { CloseStageMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { HubspotStageMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveStageMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { StageService } from './services/stage.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskStageMapper } from './services/zendesk/mappers';
import { ZohoStageMapper } from './services/zoho/mappers';
import { StageController } from './stage.controller';
import { SyncService } from './sync/sync.service';
@Module({
  controllers: [StageController],
  providers: [
    StageService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    PipedriveService,
    HubspotService,
    CloseService,
    /* PROVIDERS MAPPERS */
    ZendeskStageMapper,
    ZohoStageMapper,
    PipedriveStageMapper,
    HubspotStageMapper,
    CloseStageMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class StageModule {}
