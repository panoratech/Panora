import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { Module } from '@nestjs/common';
import { FulfillmentController } from './fulfillment.controller';
import { FulfillmentService } from './services/fulfillment.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyService } from './services/shopify';
import { ShopifyFulfillmentMapper } from './services/shopify/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [FulfillmentController],
  providers: [
    FulfillmentService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    ShopifyFulfillmentMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
  ],
  exports: [SyncService],
})
export class FulfillmentModule {}
