import { Injectable } from '@nestjs/common';
import { IDriveService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IDriveService>;

  constructor() {
    this.serviceMap = new Map<string, IDriveService>();
  }

  registerService(serviceKey: string, service: IDriveService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IDriveService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      //throw new ReferenceError();
      return null;
    }
    return service;
  }
}
