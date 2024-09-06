import { LinearTicketMapper } from './services/linear/mappers';
import { LinearService } from './services/linear';
import { GithubTicketMapper } from './services/github/mappers';
import { GithubService } from './services/github';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { FrontService } from './services/front';
import { FrontTicketMapper } from './services/front/mappers';
import { GitlabService } from './services/gitlab';
import { GitlabTicketMapper } from './services/gitlab/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasTicketMapper } from './services/gorgias/mappers';
import { JiraService } from './services/jira';
import { JiraTicketMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { TicketService } from './services/ticket.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskTicketMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
import { TicketController } from './ticket.controller';
@Module({
  controllers: [TicketController],
  providers: [
    TicketService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    JiraService,
    GorgiasService,
    GitlabService,
    /* PROVIDERS MAPPERS */
    ZendeskTicketMapper,
    FrontTicketMapper,
    JiraTicketMapper,
    GorgiasTicketMapper,
    GitlabTicketMapper,
    GithubService,
    GithubTicketMapper,
    LinearService,
    LinearTicketMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService, IngestDataService],
})
export class TicketModule {}
