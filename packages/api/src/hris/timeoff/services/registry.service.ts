import { Injectable } from '@nestjs/common';
import { ITimeoffService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITimeoffService>;

  constructor() {
    this.serviceMap = new Map<string, ITimeoffService>();
  }

  registerService(serviceKey: string, service: ITimeoffService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITimeoffService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
