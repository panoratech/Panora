import { Injectable } from '@nestjs/common';
import { Zoho_ContactCreated } from './types';
import { ApiResponse } from '../../types';

@Injectable()
export class ZohoService {
  async addContact(): Promise<ApiResponse<Zoho_ContactCreated>> {
    return;
  }
}
