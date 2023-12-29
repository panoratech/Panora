import { Injectable } from '@nestjs/common';
import { IAttachmentService } from '../types';
import { ZendeskAttachmentService } from './zendesk';

@Injectable()
export class AttachmentServiceRegistry {
  private serviceMap: Map<string, IAttachmentService>;

  constructor(zendesk: ZendeskAttachmentService) {
    //TODO
    this.serviceMap = new Map<string, IAttachmentService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): IAttachmentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
