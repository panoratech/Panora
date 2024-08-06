import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ManagedWebhooksDto,
  RemoteThirdPartyCreationDto,
} from './dto/managed-webhooks.dto';
import { ManagedWebhooksService } from './managed-webhooks.service';

@ApiTags('managed_webhooks')
@ApiExcludeController()
@Controller('managed_webhooks')
export class ManagedWebhooksController {
  constructor(
    private managedWebhookService: ManagedWebhooksService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(ManagedWebhooksController.name);
  }

  @ApiOperation({
    operationId: 'getManagedWebhooks',
    summary: 'Retrieve managed webhooks',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get(':id_connection')
  getManagedWebhook(@Param('id_connection') id_connection: string) {
    return this.managedWebhookService.getManagedWebhook(id_connection);
  }

  @ApiOperation({
    operationId: 'updateManagedWebhooksStatus',
    summary: 'Update managed webhook status',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id_connection')
  async updateManagedWebhooksStatus(
    @Param('id_connection') id_connection: string,
    @Body('active') active: boolean,
  ) {
    return this.managedWebhookService.updateStatusManagedWebhookEndpoint(
      id_connection,
      active,
    );
  }

  @ApiOperation({
    operationId: 'createManagedWebhook',
    summary: 'Create managed webhook',
  })
  @ApiBody({ type: ManagedWebhooksDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  async addManagedWebhook(@Body() data: ManagedWebhooksDto) {
    return this.managedWebhookService.createManagedWebhook(data);
  }

  @ApiOperation({
    operationId: 'createRemoteThirdPartyWebhook',
    summary: 'Create Remote Third Party Webhook',
  })
  @ApiBody({ type: RemoteThirdPartyCreationDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post('remoteThirdPartyCreation')
  async createRemoteThirdPartyWebhook(
    @Body() data: RemoteThirdPartyCreationDto,
  ) {
    return this.managedWebhookService.createRemoteThirdPartyWebhook(data);
  }
}
