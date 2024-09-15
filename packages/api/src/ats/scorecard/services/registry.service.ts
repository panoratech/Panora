import { Injectable } from '@nestjs/common';
import { IScoreCardService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IScoreCardService>;

  constructor() {
    this.serviceMap = new Map<string, IScoreCardService>();
  }

  registerService(serviceKey: string, service: IScoreCardService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IScoreCardService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
