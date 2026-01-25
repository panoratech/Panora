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
    this.logger.log(
      `Attempting to create external webhook for connection ID: ${id_connection}`,
    );

    try {
      const conn = await this.prisma.connections.findFirst({
        where: {
          id_connection: id_connection,
        },
      });

      if (!conn) {
        this.logger.warn(
          `No connection found for ID: ${id_connection}. Aborting webhook creation.`,
        );
        return;
      }

      this.logger.log(
        `Connection found: ${conn.provider_slug}. Proceeding with webhook creation.`,
      );

      switch (conn.provider_slug) {
        case 'zendesk':
          this.logger.log(
            `Creating webhook for provider: zendesk with data: ${JSON.stringify(
              data,
            )}`,
          );
          return await this.zendesk.createWebhook(data, mw_ids);
        default:
          this.logger.warn(
            `Unhandled provider slug: ${conn.provider_slug}. Webhook creation skipped.`,
          );
          return;
      }
    } catch (error) {
      this.logger.error(
        `Error occurred while creating external webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async handleExternalIncomingWebhook(metadata: {
    connector_name: string;
    id_managed_webhook: string;
    payload: any;
    headers: any;
  }) {
    this.logger.log(
      `Handling incoming webhook for connector: ${metadata.connector_name} with managed webhook ID: ${metadata.id_managed_webhook}`,
    );

    try {
      switch (metadata.connector_name) {
        case 'zendesk':
          this.logger.log(
            `Processing webhook for zendesk with payload: ${JSON.stringify(
              metadata.payload,
            )}`,
          );
          return await this.zendesk.handler(
            metadata.payload,
            metadata.headers,
            metadata.id_managed_webhook,
          );
        default:
          this.logger.warn(
            `Unhandled connector name: ${metadata.connector_name}. Webhook handling skipped.`,
          );
          return;
      }
    } catch (error) {
      this.logger.error(
        `Error occurred while handling incoming webhook: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
