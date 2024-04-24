import { Injectable } from '@nestjs/common';
import { IMarketingAutomationConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IMarketingAutomationConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IMarketingAutomationConnectionService>();
  }

  registerService(
    serviceKey: string,
    service: IMarketingAutomationConnectionService,
  ) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IMarketingAutomationConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
