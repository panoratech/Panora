import { Module } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { ProjectConnectorsController } from './project-connectors.controller';
import { ProjectConnectorsService } from './project-connectors.service';

@Module({
  providers: [ProjectConnectorsService, LoggerService],
  controllers: [ProjectConnectorsController],
})
export class ProjectConnectorsModule {}
