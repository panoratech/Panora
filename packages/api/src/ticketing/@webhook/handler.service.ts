import { LoggerService } from '@@core/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ZendeskHandlerService } from './zendesk/handler';
import { PrismaService } from '@@core/prisma/prisma.service';

@Injectable()
export class TicketingWebhookHandlerService {
  constructor(
    private logger: LoggerService,
    private prisma: PrismaService,
    private zendesk: ZendeskHandlerService,
  ) {
    this.logger.setContext(TicketingWebhookHandlerService.name);
  }

  async createExternalWebhook(
    id_connection: string,
    data: { [key: string]: any },
  ) {
    const conn = await this.prisma.connections.findFirst({
      where: {
        id_connection: id_connection,
      },
    });
    switch (conn.provider_slug) {
      case 'zendesk':
        return await this.zendesk.createWebhook(id_connection, data);
      default:
        return;
    }
  }

  async handleExternalIncomingWebhook(metadata: {
    connector_name: string;
    id_connection: string;
    payload: any;
    headers: any;
  }) {
    switch (metadata.connector_name) {
      case 'zendesk':
        return await this.zendesk.handler(
          metadata.payload,
          metadata.headers,
          metadata.id_connection,
        );
      default:
        return;
    }
  }
}
