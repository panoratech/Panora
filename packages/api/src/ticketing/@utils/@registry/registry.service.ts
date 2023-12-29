import { Injectable } from '@nestjs/common';
import { ZendeskService } from '@ticketing/ticket/services/zendesk';
import { ITicketingService } from '../@types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITicketingService>;

  constructor(zendesk: ZendeskService) {
    this.serviceMap = new Map<string, ITicketingService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService<T extends ITicketingService>(integrationId: string): T {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service as T;
  }
}
