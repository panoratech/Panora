import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { AttioService } from './services/attio';
import { AttioCompanyMapper } from './services/attio/mappers';
import { CloseService } from './services/close';
import { CloseCompanyMapper } from './services/close/mappers';
import { CompanyService } from './services/company.service';
import { HubspotService } from './services/hubspot';
import { HubspotCompanyMapper } from './services/hubspot/mappers';
import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { MicrosoftdynamicssalesCompanyMapper } from './services/microsoftdynamicssales/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveCompanyMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SalesforceService } from './services/salesforce';
import { ZendeskService } from './services/zendesk';
import { ZendeskCompanyMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoCompanyMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { SalesforceCompanyMapper } from './services/salesforce/mappers';

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
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
    SalesforceService,
    AttioService,
    CloseService,
    /* PROVIDERS MAPPERS */
    AttioCompanyMapper,
    CloseCompanyMapper,
    HubspotCompanyMapper,
    PipedriveCompanyMapper,
    SalesforceCompanyMapper,
    ZendeskCompanyMapper,
    ZohoCompanyMapper,
    MicrosoftdynamicssalesService,
    MicrosoftdynamicssalesCompanyMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class CompanyModule {}
