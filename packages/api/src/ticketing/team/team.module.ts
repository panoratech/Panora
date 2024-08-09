import { LinearTeamMapper } from './services/linear/mappers';
import { LinearService } from './services/linear';
import { GithubTeamMapper } from './services/github/mappers';
import { GithubService } from './services/github';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { FrontService } from './services/front';
import { FrontTeamMapper } from './services/front/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasTeamMapper } from './services/gorgias/mappers';
import { JiraService } from './services/jira';
import { JiraTeamMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { TeamService } from './services/team.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskTeamMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
import { TeamController } from './team.controller';

@Module({
  controllers: [TeamController],
  providers: [
    TeamService,
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
    /* PROVIDERS MAPPERS */
    ZendeskTeamMapper,
    FrontTeamMapper,
    JiraTeamMapper,
    GorgiasTeamMapper,
    GithubService,
    GithubTeamMapper,
    LinearService,
    LinearTeamMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class TeamModule { }
