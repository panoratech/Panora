import { Body, Controller, Get, Post, Put, Param } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
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

  @ApiOperation({ operationId: 'getWebhooksMetadata' })
  @ApiResponse({ status: 200 })
  @Get()
  getWebhooks() {
    return this.webhookService.getWebhookEndpoints();
  }

  @ApiOperation({ operationId: 'updateWebhookStatus' })
  @Put(':id')
  async updateWebhookStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.webhookService.updateStatusWebhookEndpoint(id, active);
  }

  @ApiOperation({ operationId: 'createWebhookMetadata' })
  @ApiBody({ type: WebhookDto })
  @ApiResponse({ status: 201 })
  @Post()
  async addWebhook(@Body() data: WebhookDto) {
    return this.webhookService.createWebhookEndpoint(data);
  }
}
