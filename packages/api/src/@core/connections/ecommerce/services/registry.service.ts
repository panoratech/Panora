import { Injectable } from '@nestjs/common';
import { IEcommerceConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEcommerceConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IEcommerceConnectionService>();
  }

  registerService(serviceKey: string, service: IEcommerceConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEcommerceConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
