import { LinearTagMapper } from './services/linear/mappers';
import { LinearService } from './services/linear';
import { GithubTagMapper } from './services/github/mappers';
import { GithubService } from './services/github';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { FrontService } from './services/front';
import { FrontTagMapper } from './services/front/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasTagMapper } from './services/gorgias/mappers';
import { JiraService } from './services/jira';
import { JiraTagMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { TagService } from './services/tag.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskTagMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
import { TagController } from './tag.controller';
import { GitlabService } from './services/gitlab';
import { GitlabTagMapper } from './services/gitlab/mappers';

@Module({
  controllers: [TagController],
  providers: [
    TagService,
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
    ZendeskTagMapper,
    FrontTagMapper,
    JiraTagMapper,
    GorgiasTagMapper,
    GitlabTagMapper,
    GithubService,
    GithubTagMapper,
    LinearService,
    LinearTagMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class TagModule { }
