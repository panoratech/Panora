import { Injectable } from '@nestjs/common';
import { IAutomationService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAutomationService>;

  constructor() {
    this.serviceMap = new Map<string, IAutomationService>();
  }

  registerService(serviceKey: string, service: IAutomationService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAutomationService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
