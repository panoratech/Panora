import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { MicrosoftdynamicssalesTaskMapper } from './services/microsoftdynamicssales/mappers';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { AttioService } from './services/attio';
import { AttioTaskMapper } from './services/attio/mappers';
import { CloseService } from './services/close';
import { CloseTaskMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { HubspotTaskMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveTaskMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SalesforceService } from './services/salesforce';
import { TaskService } from './services/task.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskTaskMapper } from './services/zendesk/mappers';
import { ZohoService } from './services/zoho';
import { ZohoTaskMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { TaskController } from './task.controller';
import { SalesforceTaskMapper } from './services/salesforce/mappers';
@Module({
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
    SalesforceService,
    /* PROVIDERS MAPPERS */
    ZendeskTaskMapper,
    ZohoTaskMapper,
    PipedriveTaskMapper,
    HubspotTaskMapper,
    CloseTaskMapper,
    AttioTaskMapper,
    MicrosoftdynamicssalesService,
    SalesforceTaskMapper,
    MicrosoftdynamicssalesTaskMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class TaskModule {}
