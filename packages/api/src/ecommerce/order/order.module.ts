import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyService } from './services/shopify';
import { ShopifyOrderMapper } from './services/shopify/mappers';
import { WoocommerceService } from './services/woocommerce';
import { WoocommerceOrderMapper } from './services/woocommerce/mappers';
import { SyncService } from './sync/sync.service';

@Module({
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
    WoocommerceOrderMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
    WoocommerceService,
  ],
  exports: [SyncService],
})
export class OrderModule {}
