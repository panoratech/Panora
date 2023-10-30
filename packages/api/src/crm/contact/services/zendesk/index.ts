import { Injectable } from '@nestjs/common';
import { ApiResponse, Zendesk_ContactCreated } from '../../types';

@Injectable()
export class ZendeskService {
  async addContact(): Promise<ApiResponse<Zendesk_ContactCreated>> {
    return;
  }
}
