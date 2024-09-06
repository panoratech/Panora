import { ValidateUserService } from '@@core/utils/services/validate-user.service';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionsStrategiesController } from './connections-strategies.controller';
import { ConnectionsStrategiesService } from './connections-strategies.service';

@Module({
  controllers: [ConnectionsStrategiesController],
  providers: [ConnectionsStrategiesService, ConfigService, ValidateUserService],
})
export class ConnectionsStrategiesModule {}
