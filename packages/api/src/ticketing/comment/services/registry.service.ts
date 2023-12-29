import { Injectable } from '@nestjs/common';
import { ZendeskCommentService } from './zendesk';
import { ICommentService } from '../types';

@Injectable()
export class CommentServiceRegistry {
  private serviceMap: Map<string, ICommentService>;

  constructor(zendesk: ZendeskCommentService) {
    //TODO
    this.serviceMap = new Map<string, ICommentService>();
    this.serviceMap.set('zendesk_t', zendesk);
  }

  getService(integrationId: string): ICommentService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
