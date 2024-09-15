import { Injectable } from '@nestjs/common';
import { IPayGroupService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPayGroupService>;

  constructor() {
    this.serviceMap = new Map<string, IPayGroupService>();
  }

  registerService(serviceKey: string, service: IPayGroupService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPayGroupService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
