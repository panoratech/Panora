import { Injectable } from '@nestjs/common';
import { CreateContactDto } from '../../dto/create-contact.dto';
import { ApiResponse } from '../../types';
import { FreshSales_ContactCreated } from './types';

@Injectable()
export class FreshSalesService {
  async addContact(
    createContactDto: CreateContactDto,
  ): Promise<ApiResponse<FreshSales_ContactCreated>> {
    return;
  }
}
