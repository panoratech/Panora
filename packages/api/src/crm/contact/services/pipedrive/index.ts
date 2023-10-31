import { Injectable } from '@nestjs/common';
import { Pipedrive_ContactCreated } from './types';
import { ApiResponse } from '../../types';
import { CreateContactDto } from '../../dto/create-contact.dto';

@Injectable()
export class PipedriveService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<Pipedrive_ContactCreated>> {
    return;
  }
}
