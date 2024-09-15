import { Injectable } from '@nestjs/common';
import { IIncomeStatementService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IIncomeStatementService>;

  constructor() {
    this.serviceMap = new Map<string, IIncomeStatementService>();
  }

  registerService(serviceKey: string, service: IIncomeStatementService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IIncomeStatementService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
