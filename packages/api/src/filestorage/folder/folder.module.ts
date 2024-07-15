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
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [BullQueueModule],
  controllers: [FolderController],
  providers: [
    FolderService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    BoxFolderMapper,
    Utils,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class FolderModule {}
