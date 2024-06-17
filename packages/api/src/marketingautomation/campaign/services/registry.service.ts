import { Injectable } from '@nestjs/common';
import { ICampaignService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICampaignService>;

  constructor() {
    this.serviceMap = new Map<string, ICampaignService>();
  }

  registerService(serviceKey: string, service: ICampaignService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICampaignService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
