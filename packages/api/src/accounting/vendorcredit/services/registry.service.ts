import { Injectable } from '@nestjs/common';
import { IVendorCreditService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IVendorCreditService>;

  constructor() {
    this.serviceMap = new Map<string, IVendorCreditService>();
  }

  registerService(serviceKey: string, service: IVendorCreditService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IVendorCreditService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
