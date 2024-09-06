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
import { WebflowService } from './services/webflow';
import { WebflowOrderMapper } from './services/webflow/mappers';
import { SyncService } from './sync/sync.service';
import { SquarespaceService } from './services/squarespace';
import { SquarespaceOrderMapper } from './services/squarespace/mappers';
import { AmazonOrderMapper } from './services/amazon/mappers';
import { AmazonService } from './services/amazon';

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
    SquarespaceOrderMapper,
    AmazonOrderMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
    WoocommerceService,
    SquarespaceService,
    AmazonService,
    WebflowService,
    WebflowOrderMapper,
  ],
  exports: [SyncService],
})
export class OrderModule {}
