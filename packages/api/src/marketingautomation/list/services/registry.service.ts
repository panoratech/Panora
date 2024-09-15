import { Injectable } from '@nestjs/common';
import { IListService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IListService>;

  constructor() {
    this.serviceMap = new Map<string, IListService>();
  }

  registerService(serviceKey: string, service: IListService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IListService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
