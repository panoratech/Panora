import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { AffinityConnectionService } from './services/affinity/affinity.service';
import { AttioConnectionService } from './services/attio/attio.service';
import { CapsuleConnectionService } from './services/capsule/capsule.service';
import { CloseConnectionService } from './services/close/close.service';
import { CopperConnectionService } from './services/copper/copper.service';
import { CrmConnectionsService } from './services/crm.connection.service';
import { HubspotConnectionService } from './services/hubspot/hubspot.service';
import { KeapConnectionService } from './services/keap/keap.service';
import { PipedriveConnectionService } from './services/pipedrive/pipedrive.service';
import { ServiceRegistry } from './services/registry.service';
import { TeamleaderConnectionService } from './services/teamleader/teamleader.service';
import { TeamworkConnectionService } from './services/teamwork/teamwork.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { ZohoConnectionService } from './services/zoho/zoho.service';
import { WealthboxConnectionService } from './services/wealthbox/wealthbox.service';
import { AcceloConnectionService } from './services/accelo/accelo.service';
import { MicrosoftDynamicsSalesConnectionService } from './services/microsoftdynamicssales/microsoftdynamicssales.service';
import { SalesforceConnectionService } from './services/salesforce/salesforce.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    CrmConnectionsService,
    ServiceRegistry,
    WebhookService,
    EnvironmentService,
    ConnectionsStrategiesService,
    // PROVIDERS SERVICES
    HubspotConnectionService,
    AttioConnectionService,
    ZohoConnectionService,
    ZendeskConnectionService,
    PipedriveConnectionService,
    CloseConnectionService,
    CapsuleConnectionService,
    TeamleaderConnectionService,
    AffinityConnectionService,
    KeapConnectionService,
    CopperConnectionService,
    TeamworkConnectionService,
    WealthboxConnectionService,
    AcceloConnectionService,
    MicrosoftDynamicsSalesConnectionService,
    SalesforceConnectionService,
  ],
  exports: [CrmConnectionsService],
})
export class CrmConnectionModule {}
