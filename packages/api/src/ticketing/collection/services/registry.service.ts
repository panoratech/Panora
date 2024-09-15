import { Injectable } from '@nestjs/common';
import { ICollectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICollectionService>;

  constructor() {
    this.serviceMap = new Map<string, ICollectionService>();
  }

  registerService(serviceKey: string, service: ICollectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICollectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
