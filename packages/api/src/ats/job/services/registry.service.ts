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
      return null;
    }
    return service;
  }
}
