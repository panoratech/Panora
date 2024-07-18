import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { WebhookService } from '@@core/@core-services/webhooks/panora-webhooks/webhook.service';
import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './services/customer.service';
import { ServiceRegistry } from './services/registry.service';
import { ShopifyService } from './services/shopify';
import { SyncService } from './sync/sync.service';
import { BullQueueModule } from '@@core/@core-services/queues/queue.module';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { ShopifyCustomerMapper } from './services/shopify/mappers';

@Module({
  imports: [BullQueueModule],
  controllers: [CustomerController],
  providers: [
    CustomerService,
    CoreUnification,
    SyncService,
    WebhookService,
    ServiceRegistry,
    IngestDataService,
    Utils,
    ShopifyCustomerMapper,
    /* PROVIDERS SERVICES */
    ShopifyService,
  ],
  exports: [SyncService],
})
export class CustomerModule {}
