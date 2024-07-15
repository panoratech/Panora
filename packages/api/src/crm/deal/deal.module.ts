import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { DealController } from './deal.controller';
import { AttioService } from './services/attio';
import { AttioDealMapper } from './services/attio/mappers';
import { CloseService } from './services/close';
import { CloseDealMapper } from './services/close/mappers';
import { DealService } from './services/deal.service';
import { HubspotService } from './services/hubspot';
import { HubspotDealMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveDealMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskDealMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoDealMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [BullQueueModule],
  controllers: [DealController],
  providers: [
    DealService,
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
    CloseService,
    AttioService,
    /* PROVIDERS MAPPERS */
    ZendeskDealMapper,
    ZohoDealMapper,
    PipedriveDealMapper,
    HubspotDealMapper,
    AttioDealMapper,
    CloseDealMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class DealModule {}
