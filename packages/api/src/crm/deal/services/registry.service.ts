import { Injectable } from '@nestjs/common';
import { IDealService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IDealService>;

  constructor() {
    this.serviceMap = new Map<string, IDealService>();
  }

  registerService(serviceKey: string, service: IDealService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IDealService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
