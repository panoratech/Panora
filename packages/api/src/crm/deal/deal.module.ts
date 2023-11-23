import { Module } from '@nestjs/common';
import { DealController } from './deal.controller';
import { DealService } from './services/deal.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';
import { LoggerService } from 'src/@core/logger/logger.service';

@Module({
  controllers: [DealController],
  providers: [DealService, PrismaService, LoggerService],
})
export class DealModule {}
