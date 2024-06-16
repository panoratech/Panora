import { Injectable } from '@nestjs/common';
import { ICompanyInfoService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICompanyInfoService>;

  constructor() {
    this.serviceMap = new Map<string, ICompanyInfoService>();
  }

  registerService(serviceKey: string, service: ICompanyInfoService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICompanyInfoService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
