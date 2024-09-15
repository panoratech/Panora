import { Injectable } from '@nestjs/common';
import { ITaxRateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITaxRateService>;

  constructor() {
    this.serviceMap = new Map<string, ITaxRateService>();
  }

  registerService(serviceKey: string, service: ITaxRateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITaxRateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
