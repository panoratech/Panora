import { Injectable } from '@nestjs/common';
import { IActivityService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IActivityService>;

  constructor() {
    this.serviceMap = new Map<string, IActivityService>();
  }

  registerService(serviceKey: string, service: IActivityService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IActivityService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
