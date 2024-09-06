import { Module } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  providers: [ProjectsService, LoggerService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
