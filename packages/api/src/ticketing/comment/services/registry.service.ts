import { Injectable } from '@nestjs/common';
import { ICommentService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, ICommentService>;

  constructor() {
    this.serviceMap = new Map<string, ICommentService>();
  }

  registerService(serviceKey: string, service: ICommentService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): ICommentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
