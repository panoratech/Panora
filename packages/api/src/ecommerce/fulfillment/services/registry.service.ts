import { Injectable } from '@nestjs/common';
import { IFulfillmentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IFulfillmentService>;

  constructor() {
    this.serviceMap = new Map<string, IFulfillmentService>();
  }

  registerService(serviceKey: string, service: IFulfillmentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IFulfillmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
