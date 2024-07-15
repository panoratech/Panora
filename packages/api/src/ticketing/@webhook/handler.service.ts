import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ZendeskHandlerService } from './zendesk/handler';

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
    mw_ids: string[],
  ) {
    const conn = await this.prisma.connections.findFirst({
      where: {
        id_connection: id_connection,
      },
    });
    switch (conn.provider_slug) {
      case 'zendesk':
        return await this.zendesk.createWebhook(data, mw_ids);
      default:
        return;
    }
  }

  async handleExternalIncomingWebhook(metadata: {
    connector_name: string;
    id_managed_webhook: string;
    payload: any;
    headers: any;
  }) {
    switch (metadata.connector_name) {
      case 'zendesk':
        return await this.zendesk.handler(
          metadata.payload,
          metadata.headers,
          metadata.id_managed_webhook,
        );
      default:
        return;
    }
  }
}
