import { Injectable } from '@nestjs/common';
import { IJobService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJobService>;

  constructor() {
    this.serviceMap = new Map<string, IJobService>();
  }

  registerService(serviceKey: string, service: IJobService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJobService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
