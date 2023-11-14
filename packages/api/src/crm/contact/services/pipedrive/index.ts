import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import { PipedriveContactInput, PipedriveContactOutput } from 'src/crm/@types';

@Injectable()
export class PipedriveService {
  async addContact(
    contactData: PipedriveContactInput,
  ): Promise<ApiResponse<PipedriveContactOutput>> {
    return;
  }
}
