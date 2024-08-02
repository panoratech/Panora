import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
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
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @Get()
  hello() {
    return { message: this.appService.getHello() };
  }

  @ApiOperation({ operationId: 'health' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number' },
      },
    },
  })
  @Get('health')
  health() {
    return { code: 200 };
  }
}
