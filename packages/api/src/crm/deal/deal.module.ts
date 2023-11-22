import { Module } from '@nestjs/common';
import { DealController } from './deal.controller';
import { DealService } from './services/deal.service';

@Module({
  controllers: [DealController],
  providers: [DealService],
})
export class DealModule {}
