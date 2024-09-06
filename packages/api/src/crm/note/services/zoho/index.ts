import { Injectable } from '@nestjs/common';
import { INoteService } from '@crm/note/types';
import { CrmObject } from '@crm/@lib/@types';
import { ZohoNoteInput, ZohoNoteOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class ZohoService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + ZohoService.name,
    );
    this.registry.registerService('zoho', this);
  }

  async addNote(
    noteData: ZohoNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoNoteOutput>> {
    try {
      if (!noteData.Parent_Id.module.api_name)
        throw new Error('You must attach a parent module to your note in Zoho');
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      let url: string;
      switch (noteData.Parent_Id.module.api_name) {
        case 'Accounts':
          url = `${connection.account_url}/v5/Accounts/${noteData.Parent_Id.id}/Notes`;
          break;
        case 'Contacts':
          url = `${connection.account_url}/v5/Contacts/${noteData.Parent_Id.id}/Notes`;
          break;
        case 'Deals':
          url = `${connection.account_url}/v5/Deals/${noteData.Parent_Id.id}/Notes`;
          break;
      }
      const resp = await axios.post(
        url,
        { data: [noteData] },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      const final_res = await axios.get(
        `${connection.account_url}/v5/Notes/${resp.data.data[0].details.id}?fields=Parent_Id,Owner,Created_Time,Note_Content`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      return {
        data: final_res.data.data[0],
        message: 'Zoho note created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZohoNoteOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const fields = 'Note_Title,Note_Content,Owner,ParentId';
      const resp = await axios.get(
        `${connection.account_url}/v5/Notes?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zoho notes !`);
      return {
        data: resp.data.data,
        message: 'Zoho notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
