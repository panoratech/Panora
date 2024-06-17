import { Injectable } from '@nestjs/common';
import { IDepartmentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IDepartmentService>;

  constructor() {
    this.serviceMap = new Map<string, IDepartmentService>();
  }

  registerService(serviceKey: string, service: IDepartmentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IDepartmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
