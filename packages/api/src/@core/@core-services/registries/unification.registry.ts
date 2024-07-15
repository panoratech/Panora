import { Injectable } from '@nestjs/common';
import { IUnification } from '../../utils/types/interface';

@Injectable()
export class UnificationRegistry<T extends IUnification> {
  private serviceMap: Map<string, T>;

  constructor() {
    this.serviceMap = new Map<string, T>();
  }

  registerService(serviceKey: string, service: T) {
    this.serviceMap.set(serviceKey.toLowerCase().trim(), service);
  }

  getService(category: string): T {
    const service = this.serviceMap.get(category.toLowerCase().trim());
    if (!service) {
      throw new Error();
    }
    return service;
  }
}
