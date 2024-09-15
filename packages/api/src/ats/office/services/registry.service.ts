import { Injectable } from '@nestjs/common';
import { IOfficeService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IOfficeService>;

  constructor() {
    this.serviceMap = new Map<string, IOfficeService>();
  }

  registerService(serviceKey: string, service: IOfficeService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IOfficeService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
