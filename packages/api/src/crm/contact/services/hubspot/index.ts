import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import { HubspotContactInput, HubspotContactOutput } from 'src/crm/@types';

@Injectable()
export class HubspotService {
  async addContact(
    contactData: HubspotContactInput,
  ): Promise<ApiResponse<HubspotContactOutput>> {
    return;
  }
}
