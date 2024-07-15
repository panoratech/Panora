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
  imports: [BullQueueModule],
  controllers: [DriveController],
  providers: [
    DriveService,
    SyncService,
    WebhookService,
    IngestDataService,
    ServiceRegistry,
    Utils,
    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class DriveModule {}
