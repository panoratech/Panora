import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { FrontService } from './services/front';
import { GitlabService } from './services/gitlab';
import { GorgiasService } from './services/gorgias';
import { JiraService } from './services/jira';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { ZendeskService } from './services/zendesk';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@ticketing/@lib/@utils';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { FrontUserMapper } from './services/front/mappers';
import { GitlabUserMapper } from './services/gitlab/mappers';
import { GorgiasUserMapper } from './services/gorgias/mappers';
import { JiraUserMapper } from './services/jira/mappers';
import { ZendeskUserMapper } from './services/zendesk/mappers';
@Module({
  imports: [BullQueueModule],
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
  ],
  exports: [SyncService, ServiceRegistry, WebhookService, IngestDataService],
})
export class UserModule {}
