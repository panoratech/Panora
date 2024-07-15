import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@filestorage/@lib/@utils';
import { Module } from '@nestjs/common';
import { BoxService } from './services/box';
import { BoxUserMapper } from './services/box/mappers';
import { ServiceRegistry } from './services/registry.service';
import { UserService } from './services/user.service';
import { SyncService } from './sync/sync.service';
import { UserController } from './user.controller';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
@Module({
  imports: [BullQueueModule],
  controllers: [UserController],
  providers: [
    UserService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    BoxUserMapper,
    Utils,
    /* PROVIDERS SERVICES */
    BoxService,
  ],
  exports: [SyncService],
})
export class UserModule {}
