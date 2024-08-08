import { LinearCollectionMapper } from './services/linear/mappers';
import { LinearService } from './services/linear';
import { GithubCollectionMapper } from './services/github/mappers';
import { GithubService } from './services/github';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { CollectionController } from './collection.controller';
import { CollectionService } from './services/collection.service';
import { GitlabService } from './services/gitlab';
import { GitlabCollectionMapper } from './services/gitlab/mappers';
import { JiraService } from './services/jira';
import { JiraCollectionMapper } from './services/jira/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
@Module({
  controllers: [CollectionController],
  providers: [
    CollectionService,

    SyncService,
    WebhookService,

    ServiceRegistry,

    Utils,
    IngestDataService,
    /* PROVIDERS SERVICES */
    JiraService,
    GitlabService,
    /* PROVIDERS MAPPERS */
    JiraCollectionMapper,
    GitlabCollectionMapper,
    GithubService,
    GithubCollectionMapper,
    LinearService,
    LinearCollectionMapper,
  ],
  exports: [SyncService, ServiceRegistry, WebhookService],
})
export class CollectionModule { }
