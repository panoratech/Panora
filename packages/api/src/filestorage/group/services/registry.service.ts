import { Injectable } from '@nestjs/common';
import { IGroupService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IGroupService>;

  constructor() {
    this.serviceMap = new Map<string, IGroupService>();
  }

  registerService(serviceKey: string, service: IGroupService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IGroupService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      //throw new ReferenceError();
      return null;
    }
    return service;
  }
}
