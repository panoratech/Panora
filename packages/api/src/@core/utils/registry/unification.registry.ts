import { Injectable } from '@nestjs/common';
import { IUnification } from '../types/interface';

@Injectable()
export class UnificationRegistry<T extends IUnification> {
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
