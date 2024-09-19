import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import {
  ApiGetArrayCustomResponse,
  ApiPostCustomResponse,
  ApiPostGenericJson,
} from '@@core/utils/dtos/openapi.respone.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  EventPayload,
  SignatureVerificationDto,
  WebhookDto,
  WebhookResponse,
} from './dto/webhook.dto';
import { WebhookService } from './webhook.service';
@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private webhookService: WebhookService,
    private loggerSeervice: LoggerService,
  ) {
    this.loggerSeervice.setContext(WebhookController.name);
  }

  @ApiOperation({
    operationId: 'listWebhooks',
    summary: 'List webhooks',
  })
  @ApiGetArrayCustomResponse(WebhookResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  listWebhooks(@Request() req: any) {
    const projectId = req.user.id_project;
    return this.webhookService.getWebhookEndpoints(projectId);
  }

  @ApiOperation({
    operationId: 'listWebhooks',
    summary: 'List webhooks ',
  })
  @ApiGetArrayCustomResponse(WebhookResponse)
  @UseGuards(JwtAuthGuard)
  @Get('internal')
  @ApiExcludeEndpoint()
  listInternalWebhooks(@Request() req: any) {
    const projectId = req.user.id_project;
    return this.webhookService.getWebhookEndpoints(projectId);
  }

  @ApiOperation({ operationId: 'delete', summary: 'Delete Webhook' })
  @ApiPostCustomResponse(WebhookResponse)
  @ApiParam({
    name: 'id',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    required: true,
    type: String,
    description: 'id of the webhook to delete.',
  })
  @Delete(':id')
  @UseGuards(ApiKeyAuthGuard)
  async deleteWebhook(@Request() req: any, @Param('id') whId: string) {
    const projectId = req.user.id_project;
    return await this.webhookService.deleteWebhook(whId, projectId);
  }

  @ApiOperation({ operationId: 'deleteWebhook', summary: 'Delete Webhook' })
  @ApiPostCustomResponse(WebhookResponse)
  @Delete('internal/:id')
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  async deleteInternalWebhook(@Request() req: any, @Param('id') whId: string) {
    const projectId = req.user.id_project;
    return await this.webhookService.deleteWebhook(whId, projectId);
  }

  @ApiOperation({
    operationId: 'updateStatus',
    summary: 'Update webhook status',
  })
  @UseGuards(ApiKeyAuthGuard)
  @ApiPostCustomResponse(WebhookResponse)
  @ApiParam({
    name: 'id',
    example: '801f9ede-c698-4e66-a7fc-48d19eebaa4f',
    required: true,
    type: String,
    description: 'id of the webhook to update.',
  })
  @Put(':id')
  async updateWebhookStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    const projectId = req.user.id_project;
    return this.webhookService.updateStatusWebhookEndpoint(
      id,
      active,
      projectId,
    );
  }

  @ApiOperation({
    operationId: 'updateWebhookStatus',
    summary: 'Update webhook status',
  })
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @ApiPostCustomResponse(WebhookResponse)
  @Put('internal/:id')
  async updateInternalWebhookStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('active') active: boolean,
  ) {
    const projectId = req.user.id_project;
    return this.webhookService.updateStatusWebhookEndpoint(
      id,
      active,
      projectId,
    );
  }

  @ApiOperation({
    operationId: 'createWebhookPublic',
    summary: 'Create webhook',
  })
  @ApiBody({ type: WebhookDto })
  @ApiPostCustomResponse(WebhookResponse)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addWebhook(@Request() req: any, @Body() data: WebhookDto) {
    const projectId = req.user.id_project;
    return this.webhookService.createWebhookEndpoint(data, projectId);
  }

  @ApiOperation({
    operationId: 'createWebhookInternal',
    summary: 'Create webhook',
  })
  @ApiBody({ type: WebhookDto })
  @ApiExcludeEndpoint()
  @ApiPostCustomResponse(WebhookResponse)
  @UseGuards(JwtAuthGuard)
  @Post('internal')
  async addInternalWebhook(@Request() req: any, @Body() data: WebhookDto) {
    const projectId = req.user.id_project;
    return this.webhookService.createWebhookEndpoint(data, projectId);
  }

  @ApiOperation({
    operationId: 'verifyEvent',
    summary: 'Verify payload signature of the webhook',
  })
  @ApiBody({ type: SignatureVerificationDto })
  @ApiPostGenericJson('Dynamic event payload')
  @UseGuards(ApiKeyAuthGuard)
  @Post('verifyEvent')
  async verifyPayloadSignature(@Body() data: SignatureVerificationDto) {
    const { payload, signature, secret } = data;
    const resp = await this.webhookService.verifyPayloadSignature(
      payload,
      signature,
      secret,
    );
    return resp;
  }
}
