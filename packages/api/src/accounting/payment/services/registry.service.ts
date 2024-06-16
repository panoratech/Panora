import { Injectable } from '@nestjs/common';
import { IPaymentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPaymentService>;

  constructor() {
    this.serviceMap = new Map<string, IPaymentService>();
  }

  registerService(serviceKey: string, service: IPaymentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPaymentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
