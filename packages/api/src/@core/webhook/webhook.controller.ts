import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { WebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { ValidateUserGuard } from '@@core/utils/guards/validate-user.guard';

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
  @UseGuards(JwtAuthGuard, ValidateUserGuard)
  @Get()
  getWebhooks(@Query('project_id') project_id: string) {
    return this.webhookService.getWebhookEndpoints(project_id);
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
    @Request() req: any,
  ) {
    // verify id of webhook belongs to user from req
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
    // verify project id of user is same from data
    return this.webhookService.createWebhookEndpoint(data);
  }
}
