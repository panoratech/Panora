import { Injectable } from '@nestjs/common';
import { IEngagementService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEngagementService>;

  constructor() {
    this.serviceMap = new Map<string, IEngagementService>();
  }

  registerService(serviceKey: string, service: IEngagementService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEngagementService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
