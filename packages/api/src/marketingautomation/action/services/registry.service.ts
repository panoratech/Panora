import { Injectable } from '@nestjs/common';
import { IActionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IActionService>;

  constructor() {
    this.serviceMap = new Map<string, IActionService>();
  }

  registerService(serviceKey: string, service: IActionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IActionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
