import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';

@Module({
  providers: [EventsService, LoggerService, PrismaService],
  controllers: [EventsController],
})
export class EventsModule {}
