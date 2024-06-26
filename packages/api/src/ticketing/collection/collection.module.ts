import { GitlabService } from './services/gitlab';
import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { CollectionService } from './services/collection.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { JiraService } from './services/jira';
import { UnificationRegistry } from '@@core/@core-services/registries/unification.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Module({
  imports: [],
  controllers: [CollectionController],
  providers: [
    CollectionService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    ConnectionUtils,
    CoreUnification,
    UnificationRegistry,
    MappersRegistry,
    /* PROVIDERS SERVICES */
    JiraService,
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
export class CollectionModule {}
