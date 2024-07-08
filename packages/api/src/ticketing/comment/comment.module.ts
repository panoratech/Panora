import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { CommentController } from './comment.controller';
import { CommentService } from './services/comment.service';
import { FrontService } from './services/front';
import { GitlabService } from './services/gitlab';
import { GorgiasService } from './services/gorgias';
import { JiraService } from './services/jira';
import { ServiceRegistry } from './services/registry.service';
import { ZendeskService } from './services/zendesk';
import { SyncService } from './sync/sync.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

@Module({
  imports: [BullQueueModule],
  controllers: [CommentController],
  providers: [
    CommentService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    CoreSyncRegistry,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    IngestDataService,
    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    ZendeskService,
    FrontService,
    JiraService,
    GorgiasService,
    GitlabService,
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class CommentModule {}
