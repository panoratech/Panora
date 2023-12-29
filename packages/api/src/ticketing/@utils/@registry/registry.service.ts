import { Injectable } from '@nestjs/common';
import { ZendeskService } from '@ticketing/ticket/services/zendesk';
import { ITicketService } from '@ticketing/ticket/types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITicketService>;

  constructor(zendesk: ZendeskService) {
    this.serviceMap = new Map<string, ITicketService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): ITicketService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
