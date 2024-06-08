import { Body, Controller, Post, Param, Headers } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { TicketingWebhookHandlerService } from '@ticketing/@webhook/handler.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ConnectorCategory } from '@panora/shared';

@ApiTags('mw')
@Controller('mw')
export class MWHandlerController {
  constructor(
    private loggerService: LoggerService,
    private prisma: PrismaService,
    private ticketingHandler: TicketingWebhookHandlerService,
  ) {
    this.loggerService.setContext(MWHandlerController.name);
  }

  @ApiOperation({
    operationId: 'handleThirdPartyWebhook',
    summary: 'Handle Third Party Webhook',
  })
  @ApiResponse({ status: 201 })
  @Post(':endpoint_uuid')
  async handleThirdPartyWebhook(
    @Body() data: any,
    @Headers() headers: any,
    @Param('uuid') uuid: string,
  ) {
    const res = await this.prisma.managed_webhooks.findFirst({
      where: {
        endpoint: uuid,
      },
    });
    const id_connection = res.id_connection;
    const connection = await this.prisma.connections.findFirst({
      where: {
        id_connection: id_connection,
      },
    });
    const metadata = {
      connector_name: connection.provider_slug,
      endpoint_uuid: uuid,
      id_connection: id_connection,
      payload: data,
      headers: headers,
    };
    switch (connection.vertical) {
      case ConnectorCategory.Ticketing:
        return await this.ticketingHandler.handleExternalIncomingWebhook(
          metadata,
        );
    }
  }
}
