import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { Module } from '@nestjs/common';
import { FulfillmentOrdersController } from './fulfillmentorders.controller';
import { FulfillmentOrdersService } from './services/fulfillmentorders.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyService } from './services/shopify';
import { ShopifyFulfillmentOrdersMapper } from './services/shopify/mappers';
import { SyncService } from './sync/sync.service';

@Module({
  controllers: [FulfillmentOrdersController],
  providers: [
    FulfillmentOrdersService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    ShopifyFulfillmentOrdersMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
  ],
  exports: [SyncService],
})
export class FulfillmentOrdersModule {}
