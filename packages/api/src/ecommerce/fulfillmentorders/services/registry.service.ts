import { Injectable } from '@nestjs/common';
import { IFulfillmentOrdersService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IFulfillmentOrdersService>;

  constructor() {
    this.serviceMap = new Map<string, IFulfillmentOrdersService>();
  }

  registerService(serviceKey: string, service: IFulfillmentOrdersService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IFulfillmentOrdersService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
