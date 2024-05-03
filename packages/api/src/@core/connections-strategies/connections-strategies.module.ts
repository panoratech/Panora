import { Module } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ConnectionsStrategiesController } from './connections-strategies.controller';
import { ConnectionsStrategiesService } from './connections-strategies.service';
import { ConfigService } from '@nestjs/config';
import { ValidateUserService } from '@@core/utils/services/validateUser.service';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Module({
  controllers: [ConnectionsStrategiesController],
  providers: [
    LoggerService,
    EncryptionService,
    PrismaService,
    ConnectionsStrategiesService,
    ConfigService,
    ValidateUserService,
  ],
})
export class ConnectionsStrategiesModule { }
