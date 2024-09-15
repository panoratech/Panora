import { Injectable } from '@nestjs/common';
import { IInvoiceService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IInvoiceService>;

  constructor() {
    this.serviceMap = new Map<string, IInvoiceService>();
  }

  registerService(serviceKey: string, service: IInvoiceService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IInvoiceService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
