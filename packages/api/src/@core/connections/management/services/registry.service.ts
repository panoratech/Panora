import { Injectable } from '@nestjs/common';
import { IManagementConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IManagementConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IManagementConnectionService>();
  }

  registerService(serviceKey: string, service: IManagementConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IManagementConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
