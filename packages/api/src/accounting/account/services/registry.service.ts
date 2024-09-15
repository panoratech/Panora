import { Injectable } from '@nestjs/common';
import { IAccountService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAccountService>;

  constructor() {
    this.serviceMap = new Map<string, IAccountService>();
  }

  registerService(serviceKey: string, service: IAccountService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAccountService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
