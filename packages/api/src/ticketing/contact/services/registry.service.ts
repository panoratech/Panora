import { Injectable } from '@nestjs/common';
import { IContactService } from '../types';
import { ZendeskContactService } from './zendesk';

@Injectable()
export class ContactServiceRegistry {
  private serviceMap: Map<string, IContactService>;

  constructor(zendesk: ZendeskContactService) {
    //TODO
    this.serviceMap = new Map<string, IContactService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): IContactService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
