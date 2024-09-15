import { Injectable } from '@nestjs/common';
import { IEmployeeService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEmployeeService>;

  constructor() {
    this.serviceMap = new Map<string, IEmployeeService>();
  }

  registerService(serviceKey: string, service: IEmployeeService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEmployeeService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
