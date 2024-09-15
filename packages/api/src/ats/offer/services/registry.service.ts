import { Injectable } from '@nestjs/common';
import { IOfferService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IOfferService>;

  constructor() {
    this.serviceMap = new Map<string, IOfferService>();
  }

  registerService(serviceKey: string, service: IOfferService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IOfferService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
