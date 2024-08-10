import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { BoxService } from './services/box';
import { BoxGroupMapper } from './services/box/mappers';
import { GroupService } from './services/group.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [GroupController],
  providers: [
    GroupService,
    SyncService,
    CoreUnification,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    BoxGroupMapper,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class GroupModule {}
