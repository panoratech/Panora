import { Injectable } from '@nestjs/common';
import { ITransactionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITransactionService>;

  constructor() {
    this.serviceMap = new Map<string, ITransactionService>();
  }

  registerService(serviceKey: string, service: ITransactionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITransactionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
