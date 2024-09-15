import { Injectable } from '@nestjs/common';
import { IExpenseService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IExpenseService>;

  constructor() {
    this.serviceMap = new Map<string, IExpenseService>();
  }

  registerService(serviceKey: string, service: IExpenseService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IExpenseService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
