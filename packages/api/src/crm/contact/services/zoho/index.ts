import { Injectable } from '@nestjs/common';
import { Zoho_ContactCreated } from './types';
import { ApiResponse } from '../../types';
import { CreateContactDto } from '../../dto/create-contact.dto';

@Injectable()
export class ZohoService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Zoho_ContactCreated>> {
    return;
  }
}
