import { Module } from '@nestjs/common';
import { ContactModule } from './contact/contact.module';
import { DealModule } from './deal/deal.module';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';

@Module({
  imports: [ContactModule, DealModule],
  providers: [CrmService],
  controllers: [CrmController],
})
export class CrmModule {}
