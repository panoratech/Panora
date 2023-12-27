import { Injectable } from '@nestjs/common';
import { ITicketingConnectionService } from '../types';
import { ZendeskConnectionService } from './zendesk/zendesk.service';

@Injectable()
export class ServiceConnectionRegistry {
  private serviceMap: Map<string, ITicketingConnectionService>;

  constructor(zendesk: ZendeskConnectionService) {
    this.serviceMap = new Map<string, ITicketingConnectionService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): ITicketingConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(
        `Connection Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
