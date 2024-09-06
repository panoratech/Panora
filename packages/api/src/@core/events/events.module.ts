import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  providers: [EventsService, ValidateUserService],
  controllers: [EventsController],
})
export class EventsModule {}
