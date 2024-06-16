import { Injectable } from '@nestjs/common';
import { ICreditNoteService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICreditNoteService>;

  constructor() {
    this.serviceMap = new Map<string, ICreditNoteService>();
  }

  registerService(serviceKey: string, service: ICreditNoteService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICreditNoteService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
