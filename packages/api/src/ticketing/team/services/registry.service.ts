import { Injectable } from '@nestjs/common';
import { ITeamService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ITeamService>;

  constructor() {
    this.serviceMap = new Map<string, ITeamService>();
  }

  registerService(serviceKey: string, service: ITeamService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ITeamService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
