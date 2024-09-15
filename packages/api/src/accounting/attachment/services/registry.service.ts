import { Injectable } from '@nestjs/common';
import { IAttachmentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IAttachmentService>;

  constructor() {
    this.serviceMap = new Map<string, IAttachmentService>();
  }

  registerService(serviceKey: string, service: IAttachmentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IAttachmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
