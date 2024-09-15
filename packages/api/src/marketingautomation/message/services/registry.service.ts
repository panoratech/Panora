import { Injectable } from '@nestjs/common';
import { IMessageService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IMessageService>;

  constructor() {
    this.serviceMap = new Map<string, IMessageService>();
  }

  registerService(serviceKey: string, service: IMessageService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IMessageService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
