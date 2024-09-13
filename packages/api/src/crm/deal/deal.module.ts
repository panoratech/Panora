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
import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { MicrosoftdynamicssalesDealMapper } from './services/microsoftdynamicssales/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveDealMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SalesforceService } from './services/salesforce';
import { ZendeskService } from './services/zendesk';
import { ZendeskDealMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoDealMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { SalesforceDealMapper } from './services/salesforce/mappers';

@Module({
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
    SalesforceService,
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
    SalesforceDealMapper,
    CloseDealMapper,
    MicrosoftdynamicssalesService,
    MicrosoftdynamicssalesDealMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class DealModule {}
