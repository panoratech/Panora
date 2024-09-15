import { Injectable } from '@nestjs/common';
import { ICompanyService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICompanyService>;

  constructor() {
    this.serviceMap = new Map<string, ICompanyService>();
  }

  registerService(serviceKey: string, service: ICompanyService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICompanyService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
