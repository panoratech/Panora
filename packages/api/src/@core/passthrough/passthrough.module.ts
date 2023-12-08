import { Module } from '@nestjs/common';
import { PassthroughService } from './passthrough.service';
import { PassthroughController } from './passthrough.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';

@Module({
  providers: [PassthroughService, LoggerService, PrismaService],
  controllers: [PassthroughController],
})
export class PassthroughModule {}
