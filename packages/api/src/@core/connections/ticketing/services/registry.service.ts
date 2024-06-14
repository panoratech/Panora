import { Injectable } from '@nestjs/common';
import { ITicketingConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITicketingConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, ITicketingConnectionService>();
  }

  registerService(serviceKey: string, service: ITicketingConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITicketingConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
