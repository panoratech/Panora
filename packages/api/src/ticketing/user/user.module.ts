import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { FrontService } from './services/front';
import { FrontUserMapper } from './services/front/mappers';
import { GithubService } from './services/github';
import { GithubUserMapper } from './services/github/mappers';
import { GitlabService } from './services/gitlab';
import { GitlabUserMapper } from './services/gitlab/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasUserMapper } from './services/gorgias/mappers';
import { JiraService } from './services/jira';
import { JiraUserMapper } from './services/jira/mappers';
import { LinearService } from './services/linear';
import { LinearUserMapper } from './services/linear/mappers';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskUserMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
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
    FrontService,
    JiraService,
    GorgiasService,
    GitlabService,
    /* PROVIDERS MAPPERS */
    ZendeskUserMapper,
    FrontUserMapper,
    JiraUserMapper,
    GorgiasUserMapper,
    GitlabUserMapper,
    GithubService,
    GithubUserMapper,
    LinearService,
    LinearUserMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService, IngestDataService],
})
export class UserModule {}
