import { Injectable } from '@nestjs/common';
import { ISharedLinkService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ISharedLinkService>;

  constructor() {
    this.serviceMap = new Map<string, ISharedLinkService>();
  }

  registerService(serviceKey: string, service: ISharedLinkService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ISharedLinkService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      //throw new ReferenceError();
      return null;
    }
    return service;
  }
}
