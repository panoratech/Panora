import { Module } from '@nestjs/common';
import { EcommerceUnificationService } from './@lib/@unification';
import { ProductModule } from './product/product.module';

@Module({
  exports: [ProductModule],
  providers: [EcommerceUnificationService],
  imports: [ProductModule],
})
export class EcommerceModule {}
