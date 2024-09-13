import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { AttioService } from './services/attio';
import { AttioContactMapper } from './services/attio/mappers';
import { CloseService } from './services/close';
import { CloseContactMapper } from './services/close/mappers';
import { ContactService } from './services/contact.service';
import { HubspotService } from './services/hubspot';
import { HubspotContactMapper } from './services/hubspot/mappers';
import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { MicrosoftdynamicssalesContactMapper } from './services/microsoftdynamicssales/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveContactMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SalesforceService } from './services/salesforce';
import { ZendeskService } from './services/zendesk';
import { ZendeskContactMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoContactMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { SalesforceContactMapper } from './services/salesforce/mappers';

@Module({
  controllers: [ContactController],
  providers: [
    ContactService,
    FieldMappingService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    AttioService,
    ZendeskService,
    SalesforceService,
    ZohoService,
    PipedriveService,
    HubspotService,
    CloseService,
    /* PROVIDERS MAPPERS */
    AttioContactMapper,
    CloseContactMapper,
    HubspotContactMapper,
    SalesforceContactMapper,
    PipedriveContactMapper,
    ZendeskContactMapper,
    ZohoContactMapper,
    MicrosoftdynamicssalesService,
    MicrosoftdynamicssalesContactMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class ContactModule {}
