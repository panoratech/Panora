import { Injectable } from '@nestjs/common';
import { IScreeningQuestionService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IScreeningQuestionService>;

  constructor() {
    this.serviceMap = new Map<string, IScreeningQuestionService>();
  }

  registerService(serviceKey: string, service: IScreeningQuestionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IScreeningQuestionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(
        `Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
