import { SharepointFileMapper } from './services/sharepoint/mappers';
import { SharepointService } from './services/sharepoint';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { BoxService } from './services/box';
import { BoxFileMapper } from './services/box/mappers';
import { FileService } from './services/file.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Utils } from '@filestorage/@lib/@utils';

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
    /* PROVIDERS SERVICES */
    BoxService,
    SharepointService,
    SharepointFileMapper,
  ],
  exports: [SyncService],
})
export class FileModule {}
