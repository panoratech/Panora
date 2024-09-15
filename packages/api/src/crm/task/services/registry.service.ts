import { Injectable } from '@nestjs/common';
import { ITaskService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITaskService>;

  constructor() {
    this.serviceMap = new Map<string, ITaskService>();
  }

  registerService(serviceKey: string, service: ITaskService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITaskService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
