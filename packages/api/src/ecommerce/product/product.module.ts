import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyService } from './services/shopify';
import { ShopifyProductMapper } from './services/shopify/mappers';
import { SquarespaceService } from './services/squarespace';
import { SquarespaceProductMapper } from './services/squarespace/mappers';
import { WoocommerceService } from './services/woocommerce';
import { WoocommerceProductMapper } from './services/woocommerce/mappers';
import { WebflowService } from './services/webflow';
import { WebflowProductMapper } from './services/webflow/mappers';
import { SyncService } from './sync/sync.service';

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
    SquarespaceProductMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
    WoocommerceService,
    SquarespaceService,
    WebflowService,
    WebflowProductMapper,
  ],
  exports: [SyncService],
})
export class ProductModule {}
