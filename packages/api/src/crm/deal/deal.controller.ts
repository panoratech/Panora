import { Controller, Post, Body, Query } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { DealService } from './services/deal.service';

@Controller('crm/deal')
export class DealController {
  constructor(
    private readonly dealService: DealService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(DealController.name);
  }
}
