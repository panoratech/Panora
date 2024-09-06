import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { LinkedUsersController } from './linked-users.controller';
import { LinkedUsersService } from './linked-users.service';

@Module({
  providers: [LinkedUsersService, ValidateUserService],
  controllers: [LinkedUsersController],
})
export class LinkedUsersModule {}
