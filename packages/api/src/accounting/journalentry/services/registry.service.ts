import { Injectable } from '@nestjs/common';
import { IJournalEntryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJournalEntryService>;

  constructor() {
    this.serviceMap = new Map<string, IJournalEntryService>();
  }

  registerService(serviceKey: string, service: IJournalEntryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJournalEntryService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
