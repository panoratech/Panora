import { Injectable } from '@nestjs/common';
import { ICrmConnectionService } from '../types';
import { ZohoConnectionService } from './zoho/zoho.service';
import { ZendeskConnectionService } from './zendesk/zendesk.service';
import { PipedriveConnectionService } from './pipedrive/pipedrive.service';
import { HubspotConnectionService } from './hubspot/hubspot.service';
import { FreshsalesConnectionService } from './freshsales/freshsales.service';

@Injectable()
export class ServiceConnectionRegistry {
  private serviceMap: Map<string, ICrmConnectionService>;

  constructor(
    freshsales: FreshsalesConnectionService,
    hubspot: HubspotConnectionService,
    zoho: ZohoConnectionService,
    zendesk: ZendeskConnectionService,
    pipedrive: PipedriveConnectionService,
  ) {
    this.serviceMap = new Map<string, ICrmConnectionService>();
    this.serviceMap.set('freshsales', freshsales);
    this.serviceMap.set('hubspot', hubspot);
    this.serviceMap.set('zoho', zoho);
    this.serviceMap.set('zendesk', zendesk);
    this.serviceMap.set('pipedrive', pipedrive);
  }

  getService(integrationId: string): ICrmConnectionService {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new Error(
        `Connection Service not found for integration ID: ${integrationId}`,
      );
    }
    return service;
  }
}
