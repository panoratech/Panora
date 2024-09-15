import { Injectable } from '@nestjs/common';
import { ICustomerService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICustomerService>;

  constructor() {
    this.serviceMap = new Map<string, ICustomerService>();
  }

  registerService(serviceKey: string, service: ICustomerService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICustomerService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
