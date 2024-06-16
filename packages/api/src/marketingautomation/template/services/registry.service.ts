import { Injectable } from '@nestjs/common';
import { ITemplateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITemplateService>;

  constructor() {
    this.serviceMap = new Map<string, ITemplateService>();
  }

  registerService(serviceKey: string, service: ITemplateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITemplateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
