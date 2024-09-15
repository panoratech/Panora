import { Injectable } from '@nestjs/common';
import { IPayrollRunService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPayrollRunService>;

  constructor() {
    this.serviceMap = new Map<string, IPayrollRunService>();
  }

  registerService(serviceKey: string, service: IPayrollRunService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPayrollRunService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
