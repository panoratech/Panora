import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { DealModule } from './deal/deal.module';

@Module({
  imports: [ContactModule, DealModule],
  providers: [],
  controllers: [],
  exports: [ContactModule, DealModule],
})
export class CrmModule {}
