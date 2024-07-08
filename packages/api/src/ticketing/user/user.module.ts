import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { UserService } from './services/user.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ZendeskService } from './services/zendesk';
import { FrontService } from './services/front';
import { JiraService } from './services/jira';
import { GorgiasService } from './services/gorgias';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { Utils } from '@ticketing/@lib/@utils';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreSyncRegistry } from '@@core/@core-services/registries/core-sync.registry';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

@Module({
  imports: [BullQueueModule],
  controllers: [UserController],
  providers: [
    UserService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    CoreSyncRegistry,
    UnificationRegistry,
    MappersRegistry,
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
    IngestDataService,
    LoggerService,
  ],
})
export class UserModule {}
