import { GoogledrivePermissionMapper } from './services/googledrive/mappers';
import { GoogledriveService } from './services/googledrive';
import { SharepointPermissionMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { OnedrivePermissionMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionUtils } from '@@core/connections/@utils';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { Module } from '@nestjs/common';
import { PermissionService } from './services/permission.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';

import { BullQueueModule } from '@@core/@core-services/queues/queue.module';

import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@filestorage/@lib/@utils';

@Module({
  providers: [
    PermissionService,

    SyncService,
    WebhookService,

    CoreUnification,
    Utils,
    FieldMappingService,
    ServiceRegistry,

    IngestDataService,

    /* PROVIDERS SERVICES */
    SharepointService,
    SharepointPermissionMapper,
    OnedriveService,
    OnedrivePermissionMapper,
    GoogledriveService,
    GoogledrivePermissionMapper,
  ],
  exports: [SyncService],
})
export class PermissionModule {}
