import { Module } from '@nestjs/common';
import { LinkedUsersService } from './linked-users.service';
import { LinkedUsersController } from './linked-users.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [LinkedUsersService, LoggerService, PrismaService],
  controllers: [LinkedUsersController],
})
export class LinkedUsersModule {}
