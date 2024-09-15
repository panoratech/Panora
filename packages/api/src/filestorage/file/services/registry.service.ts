import { Injectable } from '@nestjs/common';
import { IFileService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IFileService>;

  constructor() {
    this.serviceMap = new Map<string, IFileService>();
  }

  registerService(serviceKey: string, service: IFileService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IFileService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      // throw new ReferenceError();
      return null;
    }
    return service;
  }
}
