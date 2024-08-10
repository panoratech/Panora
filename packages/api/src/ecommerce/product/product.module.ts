import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { ServiceRegistry } from './services/registry.service';
import { SyncService } from './sync/sync.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { ShopifyService } from './services/shopify';
import { ShopifyProductMapper } from './services/shopify/mappers';
import { WoocommerceService } from './services/woocommerce';
import { WoocommerceProductMapper } from './services/woocommerce/mappers';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    ShopifyProductMapper,
    WoocommerceProductMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
    WoocommerceService,
  ],
  exports: [SyncService],
})
export class ProductModule {}
