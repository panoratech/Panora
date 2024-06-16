import { Injectable } from '@nestjs/common';
import { IEmailService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEmailService>;

  constructor() {
    this.serviceMap = new Map<string, IEmailService>();
  }

  registerService(serviceKey: string, service: IEmailService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEmailService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
