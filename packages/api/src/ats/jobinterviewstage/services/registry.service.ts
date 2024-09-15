import { Injectable } from '@nestjs/common';
import { IJobInterviewStageService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJobInterviewStageService>;

  constructor() {
    this.serviceMap = new Map<string, IJobInterviewStageService>();
  }

  registerService(serviceKey: string, service: IJobInterviewStageService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJobInterviewStageService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
