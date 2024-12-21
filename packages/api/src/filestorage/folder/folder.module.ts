import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { forwardRef, Module } from '@nestjs/common';
import { FolderController } from './folder.controller';
import { BoxService } from './services/box';
import { BoxFolderMapper } from './services/box/mappers';
import { DropboxService } from './services/dropbox';
import { DropboxFolderMapper } from './services/dropbox/mappers';
import { FolderService } from './services/folder.service';
import { GoogleDriveFolderService } from './services/googledrive';
import { GoogleDriveFolderMapper } from './services/googledrive/mappers';
import { OnedriveService } from './services/onedrive';
import { OnedriveFolderMapper } from './services/onedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SharepointService } from './services/sharepoint';
import { SharepointFolderMapper } from './services/sharepoint/mappers';
import { SyncService } from './sync/sync.service';
import { FileModule } from '../file/file.module';

@Module({
  imports: [forwardRef(() => FileModule)],
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
    OnedriveFolderMapper,
    DropboxService,
    DropboxFolderMapper,
    GoogleDriveFolderService,
  ],
  exports: [SyncService, OnedriveService],
})
export class FolderModule {}
