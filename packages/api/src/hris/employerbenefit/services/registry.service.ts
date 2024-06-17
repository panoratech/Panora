import { Injectable } from '@nestjs/common';
import { IEmployerBenefitService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEmployerBenefitService>;

  constructor() {
    this.serviceMap = new Map<string, IEmployerBenefitService>();
  }

  registerService(serviceKey: string, service: IEmployerBenefitService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEmployerBenefitService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
