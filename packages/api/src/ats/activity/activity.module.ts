import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './services/activity.service';
import { AshbyService } from './services/ashby';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { AshbyActivityMapper } from './services/ashby/mappers';

@Module({
  controllers: [ActivityController],
  providers: [
    ActivityService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    AshbyActivityMapper,
    Utils,
    /* PROVIDERS SERVICES */
    AshbyService,
  ],
  exports: [SyncService],
})
export class ActivityModule {}
