import { Injectable } from '@nestjs/common';
import { ApiResponse, Hubspot_ContactCreated } from '../../types';
import { CreateContactDto } from '../../dto/create-contact.dto';

@Injectable()
export class HubspotService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Hubspot_ContactCreated>> {
    return;
  }
}
