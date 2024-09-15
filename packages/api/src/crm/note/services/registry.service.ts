import { Injectable } from '@nestjs/common';
import { INoteService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, INoteService>;

  constructor() {
    this.serviceMap = new Map<string, INoteService>();
  }

  registerService(serviceKey: string, service: INoteService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): INoteService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
