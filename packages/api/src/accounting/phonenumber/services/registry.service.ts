import { Injectable } from '@nestjs/common';
import { IPhoneNumberService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IPhoneNumberService>;

  constructor() {
    this.serviceMap = new Map<string, IPhoneNumberService>();
  }

  registerService(serviceKey: string, service: IPhoneNumberService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IPhoneNumberService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
