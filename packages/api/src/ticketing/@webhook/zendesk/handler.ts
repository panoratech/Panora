import { LoggerService } from '@@core/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskHandlerService {
  constructor(private logger: LoggerService) {
    this.logger.setContext(ZendeskHandlerService.name);
  }

  async handler(payload: any, headers: any) {
    return;
  }
}
