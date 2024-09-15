import { Injectable } from '@nestjs/common';
import { ITicketService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITicketService>;

  constructor() {
    this.serviceMap = new Map<string, ITicketService>();
  }

  registerService(serviceKey: string, service: ITicketService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITicketService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
