import { Module } from '@nestjs/common';
import { OrganisationsService } from './organisations.service';
import { OrganisationsController } from './organisations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';

@Module({
  providers: [OrganisationsService, PrismaService, LoggerService],
  controllers: [OrganisationsController],
})
export class OrganisationsModule {}
