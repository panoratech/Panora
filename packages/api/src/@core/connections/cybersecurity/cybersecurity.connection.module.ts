import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { CybersecurityConnectionsService } from './services/cybersecurity.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { TenableConnectionService } from './services/tenable/tenable.service';
import { QualysConnectionService } from './services/qualys/qualys.service';
import { SemgrepConnectionService } from './services/semgrep/semgrep.service';
import { SentineloneConnectionService } from './services/sentinelone/sentinelone.service';
import { Rapid7ConnectionService } from './services/rapid7insightvm/rapid7.service';
import { SnykConnectionService } from './services/snyk/snyk.service';
import { CrowdstrikeConnectionService } from './services/crowdstrike/crowdstrike.service';
import { MicrosoftdefenderConnectionService } from './services/microsoftdefender/microsoftdefender.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    CybersecurityConnectionsService,
    WebhookService,
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    SemgrepConnectionService,
    TenableConnectionService,
    QualysConnectionService,
    SentineloneConnectionService,
    Rapid7ConnectionService,
    SnykConnectionService,
    CrowdstrikeConnectionService,
    MicrosoftdefenderConnectionService,
  ],
  exports: [CybersecurityConnectionsService],
})
export class CybersecurityConnectionsModule {}
