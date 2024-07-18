import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { ShopifyService } from './services/shopify';
import { ShopifyOrderMapper } from './services/shopify/mappers';
import { OrderService } from './services/order.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';

@Module({
  imports: [BullQueueModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    ShopifyOrderMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
  ],
  exports: [SyncService],
})
export class OrderModule {}
