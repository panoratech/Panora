import { Injectable } from '@nestjs/common';
import { ICandidateService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICandidateService>;

  constructor() {
    this.serviceMap = new Map<string, ICandidateService>();
  }

  registerService(serviceKey: string, service: ICandidateService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICandidateService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
