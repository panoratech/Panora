import { Injectable } from '@nestjs/common';
import { ILocationService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ILocationService>;

  constructor() {
    this.serviceMap = new Map<string, ILocationService>();
  }

  registerService(serviceKey: string, service: ILocationService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ILocationService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
