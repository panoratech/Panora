import { Injectable } from '@nestjs/common';
import { IOrderService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IOrderService>;

  constructor() {
    this.serviceMap = new Map<string, IOrderService>();
  }

  registerService(serviceKey: string, service: IOrderService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IOrderService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
