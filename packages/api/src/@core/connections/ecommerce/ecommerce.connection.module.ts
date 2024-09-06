import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { WebhookModule } from '@@core/@core-services/webhooks/panora-webhooks/webhook.module';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { ConnectionsStrategiesService } from '@@core/connections-strategies/connections-strategies.service';
import { Module } from '@nestjs/common';
import { EcommerceConnectionsService } from './services/ecommerce.connection.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyConnectionService } from './services/shopify/shopify.service';
import { WoocommerceConnectionService } from './services/woocommerce/woocommerce.service';
import { SquarespaceConnectionService } from './services/squarespace/squarespace.service';
import { BigcommerceConnectionService } from './services/bigcommerce/bigcommerce.service';
import { EbayConnectionService } from './services/ebay/ebay.service';
import { WebflowConnectionService } from './services/webflow/webflow.service';
import { FaireConnectionService } from './services/faire/faire.service';
import { MercadolibreConnectionService } from './services/mercadolibre/mercadolibre.service';
import { AmazonConnectionService } from './services/amazon/amazon.service';

@Module({
  imports: [WebhookModule, BullQueueModule],
  providers: [
    EcommerceConnectionsService,
    WebhookService,
    EnvironmentService,
    ServiceRegistry,
    ConnectionsStrategiesService,
    //PROVIDERS SERVICES,
    ShopifyConnectionService,
    WoocommerceConnectionService,
    SquarespaceConnectionService,
    BigcommerceConnectionService,
    EbayConnectionService,
    WebflowConnectionService,
    FaireConnectionService,
    MercadolibreConnectionService,
    AmazonConnectionService,
  ],
  exports: [EcommerceConnectionsService],
})
export class EcommerceConnectionModule {}
