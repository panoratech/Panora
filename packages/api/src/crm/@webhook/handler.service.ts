import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CrmWebhookHandlerService {
  constructor(private logger: LoggerService, private prisma: PrismaService) {
    this.logger.setContext(CrmWebhookHandlerService.name);
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
      default:
        return;
    }
  }
}
