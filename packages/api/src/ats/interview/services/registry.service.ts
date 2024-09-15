import { Injectable } from '@nestjs/common';
import { IInterviewService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IInterviewService>;

  constructor() {
    this.serviceMap = new Map<string, IInterviewService>();
  }

  registerService(serviceKey: string, service: IInterviewService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IInterviewService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
