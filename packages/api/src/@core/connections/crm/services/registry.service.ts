import { Injectable } from '@nestjs/common';
import { ICrmConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICrmConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, ICrmConnectionService>();
  }

  registerService(serviceKey: string, service: ICrmConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICrmConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
