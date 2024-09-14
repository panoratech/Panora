import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { INoteService } from '@crm/note/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  SalesforceNoteInput,
  SalesforceNoteOutput,
  commonNoteSalesforceProperties,
} from './types';

@Injectable()
export class SalesforceService implements INoteService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.note.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addNote(
    noteData: SalesforceNoteInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceNoteOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'salesforce',
          vertical: 'crm',
        },
      });

      const instanceUrl = connection.account_url;
      const resp = await axios.post(
        `${instanceUrl}/services/data/v56.0/sobjects/Note/`,
        JSON.stringify(noteData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // Fetch the created note to get all details
      const noteId = resp.data.id;
      const final_resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/sobjects/Note/${noteId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: final_resp.data,
        message: 'Salesforce note created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceNoteOutput[]>> {
    try {
      const { linkedUserId, custom_properties, pageSize, cursor } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'salesforce',
          vertical: 'crm',
        },
      });

      const instanceUrl = connection.account_url;
      let pagingString = '';
      if (pageSize) {
        pagingString += `LIMIT ${pageSize} `;
      }
      if (cursor) {
        pagingString += `OFFSET ${cursor}`;
      }
      if (!pageSize && !cursor) {
        pagingString = 'LIMIT 200';
      }

      const fields =
        custom_properties?.length > 0
          ? custom_properties.join(',')
          : 'Id,Title,Body,OwnerId,ParentId,CreatedDate,LastModifiedDate';

      const query = `SELECT ${fields} FROM Note ${pagingString}`.trim();

      const resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/query/?q=${encodeURIComponent(
          query,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced Salesforce notes!`);

      return {
        data: resp.data.records,
        message: 'Salesforce notes retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.log(`Error syncing Salesforce notes: ${error.message}`);
      throw error;
    }
  }
}
