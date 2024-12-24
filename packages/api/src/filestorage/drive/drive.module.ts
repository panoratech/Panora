import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { DriveService } from './services/drive.service';
import { DriveController } from './drive.controller';
import { GoogleDriveService } from './services/googledrive';
import { GoogleDriveMapper } from './services/googledrive/mappers';
import { OnedriveService } from './services/onedrive';
import { OnedriveDriveMapper } from './services/onedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
import { SharepointService } from './services/sharepoint';
import { SharepointDriveMapper } from './services/sharepoint/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [DriveController],
  providers: [
    DriveService,
    SyncService,
    WebhookService,
    IngestDataService,
    ServiceRegistry,
    Utils,
    /* PROVIDERS SERVICES */
    OnedriveService,
    GoogleDriveService,
    GoogleDriveMapper,
    OnedriveDriveMapper,
    SharepointService,
    SharepointDriveMapper,
  ],
  exports: [SyncService],
})
export class DriveModule {}
