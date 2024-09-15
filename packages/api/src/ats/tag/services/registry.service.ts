import { Injectable } from '@nestjs/common';
import { ITagService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITagService>;

  constructor() {
    this.serviceMap = new Map<string, ITagService>();
  }

  registerService(serviceKey: string, service: ITagService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITagService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
