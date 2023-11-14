import { Injectable } from '@nestjs/common';
import { ApiResponse } from '../../types';
import { ZendeskContactInput, ZendeskContactOutput } from 'src/crm/@types';
@Injectable()
export class ZendeskService {
  async addContact(
    contactData: ZendeskContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskContactOutput>> {
    return;
  }
}
