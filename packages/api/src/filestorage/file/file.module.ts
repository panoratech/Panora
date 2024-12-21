import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module, forwardRef } from '@nestjs/common';
import { FileController } from './file.controller';
import { BoxService } from './services/box';
import { BoxFileMapper } from './services/box/mappers';
import { DropboxService } from './services/dropbox';
import { DropboxFileMapper } from './services/dropbox/mappers';
import { FileService } from './services/file.service';
import { GoogleDriveService } from './services/googledrive';
import { GoogleDriveFileMapper } from './services/googledrive/mappers';
import { OnedriveService } from './services/onedrive';
import { OnedriveFileMapper } from './services/onedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SharepointService } from './services/sharepoint';
import { SharepointFileMapper } from './services/sharepoint/mappers';
import { SyncService } from './sync/sync.service';
import { GoogleDriveQueueProcessor } from './services/googledrive/processor';
import { FolderModule } from '../folder/folder.module';
import { OnedriveQueueProcessor } from './services/onedrive/processor';

@Module({
  imports: [forwardRef(() => FolderModule)],
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
    GoogleDriveQueueProcessor,
    OnedriveQueueProcessor,
  ],
  exports: [SyncService, ServiceRegistry, GoogleDriveService],
})
export class FileModule {}
