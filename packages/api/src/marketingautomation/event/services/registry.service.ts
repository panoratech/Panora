import { Injectable } from '@nestjs/common';
import { IEventService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEventService>;

  constructor() {
    this.serviceMap = new Map<string, IEventService>();
  }

  registerService(serviceKey: string, service: IEventService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEventService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
