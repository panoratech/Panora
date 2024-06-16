import { Injectable } from '@nestjs/common';
import { IFilestorageConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IFilestorageConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IFilestorageConnectionService>();
  }

  registerService(serviceKey: string, service: IFilestorageConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IFilestorageConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
