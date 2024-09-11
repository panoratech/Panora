import { OnedriveDriveMapper } from './services/onedrive/mappers';
import { OnedriveService } from './services/onedrive';
import { SharepointDriveMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { DriveController } from './drive.controller';
import { DriveService } from './services/drive.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@filestorage/@lib/@utils';
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
    OnedriveDriveMapper,
    SharepointService,
    SharepointDriveMapper,
  ],
  exports: [SyncService],
})
export class DriveModule {}
