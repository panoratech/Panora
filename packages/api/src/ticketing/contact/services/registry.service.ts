import { Injectable } from '@nestjs/common';
import { IContactService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IContactService>;

  constructor() {
    this.serviceMap = new Map<string, IContactService>();
  }

  registerService(serviceKey: string, service: IContactService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IContactService {
    const service = this.serviceMap.get(integrationId);
    // if (!service) {
    //   throw new ReferenceError(
    //     `Service not found for integration ID: ${integrationId}`,
    //   );
    // }
    return service;
  }
}
