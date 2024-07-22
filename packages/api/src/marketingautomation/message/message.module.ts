import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './services/message.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [MessageController],
  providers: [
    MessageService,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,

    /* PROVIDERS SERVICES */
  ],
  exports: [SyncService],
})
export class MessageModule {}
