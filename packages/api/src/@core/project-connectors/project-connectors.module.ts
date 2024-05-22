import { Module } from '@nestjs/common';
import { ProjectConnectorsService } from './project-connectors.service';
import { ProjectConnectorsController } from './project-connectors.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [ProjectConnectorsService, LoggerService, PrismaService],
  controllers: [ProjectConnectorsController],
})
export class ProjectConnectorsModule {}
