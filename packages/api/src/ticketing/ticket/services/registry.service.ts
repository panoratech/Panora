import { Injectable } from '@nestjs/common';
import { ITicketService } from '../types';
import { ZendeskTicketService } from './zendesk';

@Injectable()
export class TicketServiceRegistry {
  private serviceMap: Map<string, ITicketService>;

  constructor(zendesk: ZendeskTicketService) {
    //TODO
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
