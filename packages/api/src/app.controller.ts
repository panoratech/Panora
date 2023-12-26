import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(AppController.name);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(ApiKeyAuthGuard)
  @Get('protected')
  getHello2(): string {
    return `Hello You Are On The Panora API PROTECTED endpoint!`;
  }
}
