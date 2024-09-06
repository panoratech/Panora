import { Module } from '@nestjs/common';
import { LoggerService } from '../@core-services/logger/logger.service';
import { OrganisationsController } from './organisations.controller';
import { OrganisationsService } from './organisations.service';

@Module({
  providers: [OrganisationsService, LoggerService],
  controllers: [OrganisationsController],
})
export class OrganisationsModule {}
