import { Injectable } from '@nestjs/common';
import { IAddressService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAddressService>;

  constructor() {
    this.serviceMap = new Map<string, IAddressService>();
  }

  registerService(serviceKey: string, service: IAddressService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAddressService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
