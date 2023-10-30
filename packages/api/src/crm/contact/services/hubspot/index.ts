import { Injectable } from '@nestjs/common';
import { ApiResponse, Hubspot_ContactCreated } from '../../types';

@Injectable()
export class HubspotService {
  async addContact(): Promise<ApiResponse<Hubspot_ContactCreated>> {
    return;
  }
}
