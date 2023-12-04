import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';

@Module({
  providers: [JobsService, LoggerService, PrismaService],
  controllers: [JobsController],
})
export class JobsModule {}
