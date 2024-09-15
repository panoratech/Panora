import { Injectable } from '@nestjs/common';
import { IItemService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IItemService>;

  constructor() {
    this.serviceMap = new Map<string, IItemService>();
  }

  registerService(serviceKey: string, service: IItemService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IItemService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
