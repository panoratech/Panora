import { Injectable } from '@nestjs/common';
import { IConnectionCategory } from '@@core/connections/@utils/types';

@Injectable()
export class CategoryConnectionRegistry<T = IConnectionCategory> {
  private serviceMap: Map<string, T>;

  constructor() {
    this.serviceMap = new Map<string, T>();
  }

  registerService(serviceKey: string, service: T) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(category: string): T {
    const service = this.serviceMap.get(category);
    if (!service) {
      throw new Error();
    }
    return service;
  }
}
