import { Injectable } from '@nestjs/common';
import { IMarketingautomationConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IMarketingautomationConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IMarketingautomationConnectionService>();
  }

  registerService(
    serviceKey: string,
    service: IMarketingautomationConnectionService,
  ) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IMarketingautomationConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
