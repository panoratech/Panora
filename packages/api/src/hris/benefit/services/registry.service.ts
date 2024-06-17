import { Injectable } from '@nestjs/common';
import { IBenefitService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IBenefitService>;

  constructor() {
    this.serviceMap = new Map<string, IBenefitService>();
  }

  registerService(serviceKey: string, service: IBenefitService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IBenefitService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
