import { Module } from '@nestjs/common';
import { EcommerceUnificationService } from './@lib/@unification';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { FulfillmentModule } from './fulfillment/fulfillment.module';
import { FulfillmentOrdersModule } from './fulfillmentorders/fulfillmentorders.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  exports: [
    ProductModule,
    OrderModule,
    FulfillmentModule,
    FulfillmentOrdersModule,
    CustomerModule,
  ],
  providers: [EcommerceUnificationService],
  imports: [
    ProductModule,
    OrderModule,
    CustomerModule,
    FulfillmentModule,
    FulfillmentOrdersModule,
  ],
})
export class EcommerceModule {}
