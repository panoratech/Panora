import { Injectable } from '@nestjs/common';
import { IPurchaseOrderService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPurchaseOrderService>;

  constructor() {
    this.serviceMap = new Map<string, IPurchaseOrderService>();
  }

  registerService(serviceKey: string, service: IPurchaseOrderService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPurchaseOrderService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
