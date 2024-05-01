import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';

@Module({
  providers: [EventsService, LoggerService, PrismaService, ValidateUserService],
  controllers: [EventsController],
})
export class EventsModule {}
