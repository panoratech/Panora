import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Request,
  Delete,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { SignatureVerificationDto, WebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
    private loggerSeervice: LoggerService,
  ) {
    this.loggerSeervice.setContext(WebhookController.name);
  }

  @ApiOperation({
    operationId: 'getWebhooksMetadata',
    summary: 'Retrieve webhooks metadata ',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get()
  getWebhooks(@Request() req: any) {
    const { id_project } = req.user;
    return this.webhookService.getWebhookEndpoints(id_project);
  }

  @ApiOperation({ operationId: 'deleteWebhook', summary: 'Delete Webhook' })
  @ApiResponse({ status: 201 })
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteWebhook(@Param('id') whId: string) {
    return await this.webhookService.deleteWebhook(whId);
  }

  @ApiOperation({
    operationId: 'updateWebhookStatus',
    summary: 'Update webhook status',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateWebhookStatus(
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    return this.webhookService.updateStatusWebhookEndpoint(id, active);
  }

  @ApiOperation({
    operationId: 'createWebhookMetadata',
    summary: 'Add webhook metadata',
  })
  @ApiBody({ type: WebhookDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  async addWebhook(@Body() data: WebhookDto) {
    return this.webhookService.createWebhookEndpoint(data);
  }

  @ApiOperation({
    operationId: 'verifyEvent',
    summary: 'Verify payload sgnature of the webhook',
  })
  @ApiBody({ type: SignatureVerificationDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('verifyEvent')
  async verifyPayloadSignature(@Body() data: SignatureVerificationDto) {
    const { payload, signature, secret } = data;
    return this.webhookService.verifyPayloadSignature(
      payload,
      signature,
      secret,
    );
  }
}
