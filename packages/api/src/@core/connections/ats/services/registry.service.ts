import { Injectable } from '@nestjs/common';
import { IAtsConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAtsConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IAtsConnectionService>();
  }

  registerService(serviceKey: string, service: IAtsConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAtsConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
