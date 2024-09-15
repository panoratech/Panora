import { Injectable } from '@nestjs/common';
import { IFolderService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IFolderService>;

  constructor() {
    this.serviceMap = new Map<string, IFolderService>();
  }

  registerService(serviceKey: string, service: IFolderService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IFolderService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      //throw new ReferenceError();
      return null;
    }
    return service;
  }
}
