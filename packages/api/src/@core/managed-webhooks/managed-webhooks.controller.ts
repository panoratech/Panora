import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ManagedWebhooksService } from './managed-webhooks.service';
import {
  ManagedWebhooksDto,
  RemoteThirdPartyCreationDto,
} from './dto/managed-webhooks.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
@ApiTags('managed-webhooks')
@Controller('managed-webhooks')
export class ManagedWebhooksController {
  constructor(
    private managedWebhookService: ManagedWebhooksService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(ManagedWebhooksController.name);
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve managed webhooks',
  })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get(':id_connection')
  retrieve(@Param('id_connection') id_connection: string) {
    return this.managedWebhookService.getManagedWebhook(id_connection);
  }

  @ApiOperation({
    operationId: 'update',
    summary: 'Update managed webhook status',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id_connection')
  async update(
    @Param('id_connection') id_connection: string,
    @Body('active') active: boolean,
  ) {
    return this.managedWebhookService.updateStatusManagedWebhookEndpoint(
      id_connection,
      active,
    );
  }

  @ApiOperation({
    operationId: 'create',
    summary: 'Create managed webhook',
  })
  @ApiBody({ type: ManagedWebhooksDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() data: ManagedWebhooksDto) {
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
