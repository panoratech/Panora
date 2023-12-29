import { Injectable } from '@nestjs/common';
import { FreshSalesService } from '@crm/contact/services/freshsales';
import { HubspotService } from '@crm/contact/services/hubspot';
import { ZohoService } from '@crm/contact/services/zoho';
import { ZendeskService } from '@crm/contact/services/zendesk';
import { PipedriveService } from '@crm/contact/services/pipedrive';
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
