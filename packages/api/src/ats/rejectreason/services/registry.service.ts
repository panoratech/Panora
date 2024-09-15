import { Injectable } from '@nestjs/common';
import { IRejectReasonService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IRejectReasonService>;

  constructor() {
    this.serviceMap = new Map<string, IRejectReasonService>();
  }

  registerService(serviceKey: string, service: IRejectReasonService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IRejectReasonService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
