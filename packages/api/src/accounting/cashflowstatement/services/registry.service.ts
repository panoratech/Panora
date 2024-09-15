import { Injectable } from '@nestjs/common';
import { ICashflowStatementService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICashflowStatementService>;

  constructor() {
    this.serviceMap = new Map<string, ICashflowStatementService>();
  }

  registerService(serviceKey: string, service: ICashflowStatementService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICashflowStatementService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
