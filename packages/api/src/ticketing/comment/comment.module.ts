import { LinearCommentMapper } from './services/linear/mappers';
import { LinearService } from './services/linear';
import { GithubCommentMapper } from './services/github/mappers';
import { GithubService } from './services/github';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { CommentController } from './comment.controller';
import { CommentService } from './services/comment.service';
import { FrontService } from './services/front';
import { FrontCommentMapper } from './services/front/mappers';
import { GitlabService } from './services/gitlab';
import { GitlabCommentMapper } from './services/gitlab/mappers';
import { GorgiasService } from './services/gorgias';
import { GorgiasCommentMapper } from './services/gorgias/mappers';
import { JiraService } from './services/jira';
import { JiraCommentMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { ZendeskCommentMapper } from './services/zendesk/mappers';
import { SyncService } from './sync/sync.service';
@Module({
  controllers: [CommentController],
  providers: [
    CommentService,

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
    ZendeskCommentMapper,
    FrontCommentMapper,
    JiraCommentMapper,
    GorgiasCommentMapper,
    GitlabCommentMapper,
    GithubService,
    GithubCommentMapper,
    LinearService,
    LinearCommentMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class CommentModule { }
