import { Injectable } from '@nestjs/common';
import { IEeocsService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEeocsService>;

  constructor() {
    this.serviceMap = new Map<string, IEeocsService>();
  }

  registerService(serviceKey: string, service: IEeocsService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEeocsService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
