import { Controller, Post, Body, Query } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { DealService } from './services/deal.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('crm/deal')
@Controller('crm/deal')
export class DealController {
  constructor(
    private readonly dealService: DealService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(DealController.name);
  }
}
