import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { OpportunityController } from './opportunity.controller';
import { CloseService } from './services/close';
import { CloseOpportunityMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { AttioService } from './services/attio';
import { HubspotOpportunityMapper } from './services/hubspot/mappers';
import { OpportunityService } from './services/opportunity.service';
import { PipedriveService } from './services/pipedrive';
import { PipedriveOpportunityMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskOpportunityMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoOpportunityMapper } from './services/zoho/mappers';
import { AttioOpportunityMapper } from './services/attio/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [BullQueueModule],
  controllers: [OpportunityController],
  providers: [
    OpportunityService,
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
    ZendeskOpportunityMapper,
    ZohoOpportunityMapper,
    PipedriveOpportunityMapper,
    AttioOpportunityMapper,
    HubspotOpportunityMapper,
    CloseOpportunityMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class OpportunityModule {}
