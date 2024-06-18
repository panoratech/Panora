import { Injectable } from '@nestjs/common';
import { IEmployeePayrollRunService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEmployeePayrollRunService>;

  constructor() {
    this.serviceMap = new Map<string, IEmployeePayrollRunService>();
  }

  registerService(serviceKey: string, service: IEmployeePayrollRunService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEmployeePayrollRunService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
