import { Injectable } from '@nestjs/common';
import { IBalanceSheetService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IBalanceSheetService>;

  constructor() {
    this.serviceMap = new Map<string, IBalanceSheetService>();
  }

  registerService(serviceKey: string, service: IBalanceSheetService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IBalanceSheetService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
