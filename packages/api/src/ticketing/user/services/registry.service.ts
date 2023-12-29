import { Injectable } from '@nestjs/common';
import { ZendeskUserService } from './zendesk';
import { IUserService } from '../types';

@Injectable()
export class UserServiceRegistry {
  private serviceMap: Map<string, IUserService>;

  constructor(zendesk: ZendeskUserService) {
    //TODO
    this.serviceMap = new Map<string, IUserService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): IUserService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
