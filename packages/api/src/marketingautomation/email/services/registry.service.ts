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
      return null;
    }
    return service;
  }
}
