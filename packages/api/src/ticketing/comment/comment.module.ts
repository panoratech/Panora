import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { SyncService } from './sync/sync.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ZendeskService } from './services/zendesk';
import { BullModule } from '@nestjs/bull';
import { CommentController } from './comment.controller';
import { CommentService } from './services/comment.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './services/registry.service';
import { FrontService } from './services/front';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { UnificationRegistry } from '@@core/utils/registry/unification.registry';
import { CoreUnification } from '@@core/utils/services/core.service';
import { Utils } from '@ticketing/@lib/@utils';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FrontCommentMapper } from './services/front/mappers';
import { GitlabCommentMapper } from './services/gitlab/mappers';
import { GorgiasCommentMapper } from './services/gorgias/mappers';
import { JiraCommentMapper } from './services/jira/mappers';
import { ZendeskCommentMapper } from './services/zendesk/mappers';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'webhookDelivery',
      },
      { name: 'syncTasks' },
    ),
  ],
  controllers: [CommentController],
  providers: [
    CommentService,

    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    // UnificationRegistry,
    // MappersRegistry,
    Utils,
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
  ],
  exports: [
    SyncService,
    ServiceRegistry,
    WebhookService,
    FieldMappingService,
    LoggerService,
  ],
})
export class CommentModule { }
