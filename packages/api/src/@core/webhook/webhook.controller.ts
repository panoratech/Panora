import { Body, Controller, Get, Post, Put, Param } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
    private loggerSeervice: LoggerService,
  ) {
    this.loggerSeervice.setContext(WebhookController.name);
  }

  @ApiResponse({ status: 200 })
  @Get()
  getWebhooks() {
    return this.webhookService.getWebhookEndpoints();
  }

  @Put(':id')
  async updateWebhookStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.webhookService.updateStatusWebhookEndpoint(id, active);
  }

  @ApiBody({ type: WebhookDto })
  @ApiResponse({ status: 201 })
  @Post()
  async addWebhook(@Body() data: WebhookDto) {
    return this.webhookService.createWebhookEndpoint(data);
  }
}
