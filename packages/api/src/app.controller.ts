import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AppController.name);
  }

  @Get()
  hello(): string {
    return this.appService.getHello();
  }

  @ApiOperation({ operationId: 'getHealth' })
  @Get('health')
  health(): number {
    return 200;
  }

  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ operationId: 'getHelloProtected' })
  @Get('protected')
  hello2(): string {
    return `Hello You Are On The Panora API PROTECTED endpoint!`;
  }
}
