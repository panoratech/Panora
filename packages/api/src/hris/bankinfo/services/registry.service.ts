import { Injectable } from '@nestjs/common';
import { IBankInfoService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IBankInfoService>;

  constructor() {
    this.serviceMap = new Map<string, IBankInfoService>();
  }

  registerService(serviceKey: string, service: IBankInfoService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IBankInfoService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
