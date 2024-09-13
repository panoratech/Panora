import { MicrosoftdynamicssalesUserMapper } from './services/microsoftdynamicssales/mappers';
import { MicrosoftdynamicssalesService } from './services/microsoftdynamicssales';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@crm/@lib/@utils';
import { Module } from '@nestjs/common';
import { CloseService } from './services/close';
import { AttioService } from './services/attio';
import { CloseUserMapper } from './services/close/mappers';
import { HubspotService } from './services/hubspot';
import { HubspotUserMapper } from './services/hubspot/mappers';
import { PipedriveService } from './services/pipedrive';
import { PipedriveUserMapper } from './services/pipedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskUserMapper } from './services/zendesk/mappers';
import { AttioUserMapper } from './services/attio/mappers';
import { ZohoService } from './services/zoho';
import { ZohoUserMapper } from './services/zoho/mappers';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
import { SalesforceService } from './services/salesforce';
import { SalesforceUserMapper } from './services/salesforce/mappers';
@Module({
  controllers: [UserController],
  providers: [
    UserService,
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
    MicrosoftdynamicssalesService,
    /* PROVIDERS MAPPERS */
    ZendeskUserMapper,
    ZohoUserMapper,
    PipedriveUserMapper,
    HubspotUserMapper,
    AttioUserMapper,
    CloseUserMapper,
    SalesforceUserMapper,
    MicrosoftdynamicssalesUserMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class UserModule {}
