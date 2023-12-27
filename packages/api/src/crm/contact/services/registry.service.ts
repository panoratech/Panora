import { Injectable } from '@nestjs/common';
import { FreshSalesService } from './freshsales';
import { HubspotService } from './hubspot';
import { ZohoService } from './zoho';
import { ZendeskService } from './zendesk';
import { PipedriveService } from './pipedrive';
import { IContactService } from '@crm/contact/types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IContactService>;

  constructor(
    freshsales: FreshSalesService,
    hubspot: HubspotService,
    zoho: ZohoService,
    zendesk: ZendeskService,
    pipedrive: PipedriveService,
  ) {
    this.serviceMap = new Map<string, IContactService>();
    this.serviceMap.set('freshsales', freshsales);
    this.serviceMap.set('hubspot', hubspot);
    this.serviceMap.set('zoho', zoho);
    this.serviceMap.set('zendesk', zendesk);
    this.serviceMap.set('pipedrive', pipedrive);
  }

  getService(integrationId: string): IContactService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
