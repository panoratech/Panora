import { SharepointSharedLinkMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { OnedriveSharedLinkMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { BoxSharedLinkMapper } from './services/box/mappers';
import { BoxService } from './services/box';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { ServiceRegistry } from './services/registry.service';
import { SharedLinkService } from './services/sharedlink.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';

@Module({
  providers: [
    SharedLinkService,
    SyncService,
    WebhookService,
    CoreUnification,
    FieldMappingService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    /* PROVIDERS SERVICES */
    BoxService,
    BoxSharedLinkMapper,
    SharepointService,
    SharepointSharedLinkMapper,
    OnedriveService,
    OnedriveSharedLinkMapper,
  ],
  exports: [SyncService],
})
export class SharedLinkModule {}
