import { Injectable } from '@nestjs/common';
import { IStageService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IStageService>;

  constructor() {
    this.serviceMap = new Map<string, IStageService>();
  }

  registerService(serviceKey: string, service: IStageService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IStageService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
