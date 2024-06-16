import { Injectable } from '@nestjs/common';
import { IEmploymentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IEmploymentService>;

  constructor() {
    this.serviceMap = new Map<string, IEmploymentService>();
  }

  registerService(serviceKey: string, service: IEmploymentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IEmploymentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
