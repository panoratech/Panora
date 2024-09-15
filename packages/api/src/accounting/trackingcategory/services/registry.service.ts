import { Injectable } from '@nestjs/common';
import { ITrackingCategoryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITrackingCategoryService>;

  constructor() {
    this.serviceMap = new Map<string, ITrackingCategoryService>();
  }

  registerService(serviceKey: string, service: ITrackingCategoryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITrackingCategoryService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
