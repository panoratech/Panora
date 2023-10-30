import { Injectable } from '@nestjs/common';
import { Pipedrive_ContactCreated } from './types';
import { ApiResponse } from '../../types';

@Injectable()
export class PipedriveService {
  async addContact(): Promise<ApiResponse<Pipedrive_ContactCreated>> {
    return;
  }
}
