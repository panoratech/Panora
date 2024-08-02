import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ApiGetCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';

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
      type: 'string',
    },
  })
  @Get()
  hello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ operationId: 'health' })
  @ApiOkResponse({
    schema: {
      type: 'number',
    },
  })
  @Get('health')
  health(): number {
    return 200;
  }
}
