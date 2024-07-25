import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AppController.name);
  }

  @ApiOperation({ operationId: 'hello' })
  @Get()
  hello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ operationId: 'health' })
  @Get('health')
  health(): number {
    return 200;
  }
}
