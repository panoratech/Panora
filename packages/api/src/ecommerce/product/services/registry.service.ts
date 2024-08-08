import { Injectable } from '@nestjs/common';
import { IProductService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IProductService>;

  constructor() {
    this.serviceMap = new Map<string, IProductService>();
  }

  registerService(serviceKey: string, service: IProductService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IProductService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
