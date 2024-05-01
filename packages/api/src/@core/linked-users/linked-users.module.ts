import { Module } from '@nestjs/common';
import { LinkedUsersService } from './linked-users.service';
import { LinkedUsersController } from './linked-users.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';

@Module({
  providers: [
    LinkedUsersService,
    LoggerService,
    PrismaService,
    ValidateUserService,
  ],
  controllers: [LinkedUsersController],
})
export class LinkedUsersModule {}
