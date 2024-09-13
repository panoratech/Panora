import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { DriveController } from './drive.controller';
import { DriveService } from './services/drive.service';
import { GoogleDriveService } from './services/googledrive';
import { GoogleDriveMapper } from './services/googledrive/mappers';
import { OnedriveService } from './services/onedrive';
import { OnedriveDriveMapper } from './services/onedrive/mappers';
import { ServiceRegistry } from './services/registry.service';
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
  ],
  exports: [SyncService],
})
export class DriveModule {}
