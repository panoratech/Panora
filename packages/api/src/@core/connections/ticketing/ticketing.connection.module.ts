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
import { JiraServiceMgmtConnectionService } from './services/jira_service_mgmt/jira.service';
import { LinearConnectionService } from './services/linear/linear.service';
import { GitlabConnectionService } from './services/gitlab/gitlab.service';
import { ClickupConnectionService } from './services/clickup/clickup.service';
import { GorgiasConnectionService } from './services/gorgias/gorgias.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';

@Module({
  imports: [WebhookModule],
  providers: [
    TicketingConnectionsService,
    PrismaService,
    LoggerService,
    WebhookService,
    EnvironmentService,
    EncryptionService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES
    ZendeskConnectionService,
    FrontConnectionService,
    GithubConnectionService,
    JiraConnectionService,
    JiraServiceMgmtConnectionService,
    LinearConnectionService,
    GitlabConnectionService,
    ClickupConnectionService,
    GorgiasConnectionService,
  ],
  exports: [TicketingConnectionsService],
})
export class TicketingConnectionModule {}
