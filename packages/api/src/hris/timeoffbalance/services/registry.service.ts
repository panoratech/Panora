import { Injectable } from '@nestjs/common';
import { ITimeoffBalanceService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITimeoffBalanceService>;

  constructor() {
    this.serviceMap = new Map<string, ITimeoffBalanceService>();
  }

  registerService(serviceKey: string, service: ITimeoffBalanceService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITimeoffBalanceService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
