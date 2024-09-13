import { SharepointFolderMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { OnedriveFolderMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { BoxService } from './services/box';
import { BoxFolderMapper } from './services/box/mappers';
import { FolderService } from './services/folder.service';
import { GoogleDriveFolderService } from './services/googledrive';
import { GoogleDriveFolderMapper } from './services/googledrive/mappers';
import { OnedriveService } from './services/onedrive';
import { OnedriveFolderMapper } from './services/onedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [FolderController],
  providers: [
    FolderService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    BoxFolderMapper,
    OnedriveFolderMapper,
    GoogleDriveFolderMapper,
    /* PROVIDERS SERVICES */
    BoxService,
    SharepointService,
    SharepointFolderMapper,
    OnedriveService,
    GoogleDriveFolderService,
  ],
  exports: [SyncService],
})
export class FolderModule {}
