import { LoggerService } from '@@core/logger/logger.service';
import { Injectable } from '@nestjs/common';
import { ZendeskHandlerService } from './zendesk/handler';

@Injectable()
export class TicketingWebhookHandlerService {
  constructor(
    private logger: LoggerService,
    private zendesk: ZendeskHandlerService,
  ) {
    this.logger.setContext(TicketingWebhookHandlerService.name);
  }

  async handleExternalIncomingWebhook(metadata: {
    connector_name: string;
    endpoint_uuid: string;
    id_connection: string;
    payload: any;
    headers: any;
  }) {
    switch (metadata.connector_name) {
      case 'zendesk':
        return await this.zendesk.handler(metadata.payload, metadata.headers);
      default:
        return;
    }
  }
}
