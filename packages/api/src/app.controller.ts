import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces } from '@nestjs/swagger';
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
    description: 'Returns a greeting message',
    schema: {
      type: 'string',
    },
  })
  @ApiProduces('text/plain')
  @Get()
  hello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ operationId: 'health' })
  @ApiOkResponse({
    description: 'Api is healthy',
    schema: {
      type: 'number',
      example: 200,
    },
  })
  @Get('health')
  health() {
    return 200;
  }
}
