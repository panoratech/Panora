import { Module } from '@nestjs/common';
import { CrmConnectionsService } from './services/crm.connection.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from './services/registry.service';
import { HubspotConnectionService } from './services/hubspot/hubspot.service';
import { ZohoConnectionService } from './services/zoho/zoho.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { PipedriveConnectionService } from './services/pipedrive/pipedrive.service';
import { AttioConnectionService } from './services/attio/attio.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { CloseConnectionService } from './services/close/close.service';
import { CapsuleConnectionService } from './services/capsule/capsule.service';
import { TeamleaderConnectionService } from './services/teamleader/teamleader.service';
import { ConnectionUtils } from '../@utils';
import { AffinityConnectionService } from './services/affinity/affinity.service';
import { KeapConnectionService } from './services/keap/keap.service';
import { CopperConnectionService } from './services/copper/copper.service';
import { TeamworkConnectionService } from './services/teamwork/teamwork.service';

@Module({
  imports: [WebhookModule],
  providers: [
    CrmConnectionsService,
    ServiceRegistry,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ConnectionsStrategiesService,
    ConnectionUtils,
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
  ],
  exports: [CrmConnectionsService],
})
export class CrmConnectionModule {}
