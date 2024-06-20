import { Module } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskConnectionService } from './services/zendesk/zendesk.service';
import { LoggerService } from '@@core/logger/logger.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { WebhookModule } from '@@core/webhook/webhook.module';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingConnectionsService } from './services/ticketing.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { FrontConnectionService } from './services/front/front.service';
import { GithubConnectionService } from './services/github/github.service';
import { JiraConnectionService } from './services/jira/jira.service';
import { LinearConnectionService } from './services/linear/linear.service';
import { GitlabConnectionService } from './services/gitlab/gitlab.service';
import { ClickupConnectionService } from './services/clickup/clickup.service';
import { GorgiasConnectionService } from './services/gorgias/gorgias.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { ManagedWebhooksModule } from '@@core/managed-webhooks/managed-webhooks.module';
import { AhaConnectionService } from './services/aha/aha.service';
import { ConnectionUtils } from '../@utils';
import { DixaConnectionService } from './services/dixa/dixa.service';
import { HelpscoutConnectionService } from './services/helpscout/helpscout.service';
import { AsanaConnectionService } from './services/asana/asana.service';
import { WrikeConnectionService } from './services/wrike/wrike.service';
import { IroncladConnectionService } from './services/ironclad/ironclad.service';

@Module({
  imports: [WebhookModule, ManagedWebhooksModule],
  providers: [
    TicketingConnectionsService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    ConnectionUtils,
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
  ],
  exports: [TicketingConnectionsService],
})
export class TicketingConnectionModule {}
