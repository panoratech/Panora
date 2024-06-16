import { Injectable } from '@nestjs/common';
import { IHrisConnectionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IHrisConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IHrisConnectionService>();
  }

  registerService(serviceKey: string, service: IHrisConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IHrisConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
