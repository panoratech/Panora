import { Injectable } from '@nestjs/common';
import { IApplicationService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IApplicationService>;

  constructor() {
    this.serviceMap = new Map<string, IApplicationService>();
  }

  registerService(serviceKey: string, service: IApplicationService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IApplicationService {
    const service = this.serviceMap.get(integrationId);
    // if (!service) {
    //   throw new ReferenceError(
    //     `Service not found for integration ID: ${integrationId}`,
    //   );
    // }
    return service;
  }
}
