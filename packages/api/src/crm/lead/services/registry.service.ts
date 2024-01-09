import { Injectable } from '@nestjs/common';
import { ILeadService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ILeadService>;

  constructor() {
    this.serviceMap = new Map<string, ILeadService>();
  }

  registerService(serviceKey: string, service: ILeadService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ILeadService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error();
    }
    return service;
  }
}
