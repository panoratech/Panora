import { Injectable } from '@nestjs/common';
import { ApiResponse, Zendesk_ContactCreated } from '../../types';
import { CreateContactDto } from '../../dto/create-contact.dto';

@Injectable()
export class ZendeskService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Zendesk_ContactCreated>> {
    return;
  }
}
