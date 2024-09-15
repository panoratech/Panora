import { Injectable } from '@nestjs/common';
import { IPermissionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPermissionService>;

  constructor() {
    this.serviceMap = new Map<string, IPermissionService>();
  }

  registerService(serviceKey: string, service: IPermissionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPermissionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      //throw new ReferenceError();
      return null;
    }
    return service;
  }
}
