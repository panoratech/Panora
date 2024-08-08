import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { ManagedWebhooksModule } from '@@core/@core-services/webhooks/third-parties-webhooks/managed-webhooks.module';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { AhaConnectionService } from './services/aha/aha.service';
import { AsanaConnectionService } from './services/asana/asana.service';
import { ClickupConnectionService } from './services/clickup/clickup.service';
import { DixaConnectionService } from './services/dixa/dixa.service';
import { FrontConnectionService } from './services/front/front.service';
import { GithubConnectionService } from './services/github/github.service';
import { GitlabConnectionService } from './services/gitlab/gitlab.service';
import { GorgiasConnectionService } from './services/gorgias/gorgias.service';
import { HelpscoutConnectionService } from './services/helpscout/helpscout.service';
import { IroncladConnectionService } from './services/ironclad/ironclad.service';
import { JiraConnectionService } from './services/jira/jira.service';
import { LinearConnectionService } from './services/linear/linear.service';
import { ServiceRegistry } from './services/registry.service';
import { TicketingConnectionsService } from './services/ticketing.connection.service';
import { WrikeConnectionService } from './services/wrike/wrike.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';

@Module({
  imports: [WebhookModule, ManagedWebhooksModule, BullQueueModule],
  providers: [
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    ZendeskConnectionService,
    FrontConnectionService,
    GithubConnectionService,
    JiraConnectionService,
    LinearConnectionService,
    GitlabConnectionService,
    ClickupConnectionService,
    GorgiasConnectionService,
    AhaConnectionService,
    DixaConnectionService,
    HelpscoutConnectionService,
    AsanaConnectionService,
    WrikeConnectionService,
    IroncladConnectionService,
    TicketingConnectionsService,
  ],
  exports: [
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    ZendeskConnectionService,
    FrontConnectionService,
    GithubConnectionService,
    JiraConnectionService,
    LinearConnectionService,
    GitlabConnectionService,
    ClickupConnectionService,
    GorgiasConnectionService,
    AhaConnectionService,
    DixaConnectionService,
    HelpscoutConnectionService,
    AsanaConnectionService,
    WrikeConnectionService,
    IroncladConnectionService,
    TicketingConnectionsService,
  ],
})
export class TicketingConnectionModule {}
