import { Injectable } from '@nestjs/common';
import { IDependentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IDependentService>;

  constructor() {
    this.serviceMap = new Map<string, IDependentService>();
  }

  registerService(serviceKey: string, service: IDependentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IDependentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
