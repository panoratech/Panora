import { Injectable } from '@nestjs/common';
import { ITimesheetentryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITimesheetentryService>;

  constructor() {
    this.serviceMap = new Map<string, ITimesheetentryService>();
  }

  registerService(serviceKey: string, service: ITimesheetentryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITimesheetentryService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError();
    }
    return service;
  }
}
