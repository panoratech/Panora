import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ProjectsService, LoggerService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
