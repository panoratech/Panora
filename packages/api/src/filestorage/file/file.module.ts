import { DropboxFileMapper } from './services/dropbox/mappers';
import { DropboxService } from './services/dropbox';
import { SharepointFileMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { OnedriveFileMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { BoxService } from './services/box';
import { BoxFileMapper } from './services/box/mappers';
import { FileService } from './services/file.service';
import { GoogleDriveService } from './services/googledrive';
import { GoogleDriveFileMapper } from './services/googledrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SharepointService } from './services/sharepoint';
import { SharepointFileMapper } from './services/sharepoint/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [FileController],
  providers: [
    FileService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    /* MAPPERS SERVICES */
    BoxFileMapper,
    OnedriveFileMapper,
    GoogleDriveFileMapper,
    /* PROVIDERS SERVICES */
    BoxService,
    SharepointService,
    SharepointFileMapper,
    OnedriveService,
    OnedriveFileMapper,
    DropboxService,
    DropboxFileMapper,
    GoogleDriveService,
  ],
  exports: [SyncService, ServiceRegistry],
})
export class FileModule {}
