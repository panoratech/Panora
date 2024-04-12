import { Injectable } from '@nestjs/common';
import { IAccountingConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAccountingConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IAccountingConnectionService>();
  }

  registerService(serviceKey: string, service: IAccountingConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAccountingConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
