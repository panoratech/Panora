import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IContactService } from '@crm/contact/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SalesforceContactInput, SalesforceContactOutput } from './types';

@Injectable()
export class SalesforceService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addContact(
    contactData: SalesforceContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceContactOutput>> {
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
        `${instanceUrl}/services/data/v56.0/sobjects/Contact/`,
        JSON.stringify(contactData),
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
        data: resp.data,
        message: 'Salesforce contact created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceContactOutput[]>> {
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
          : 'Id,FirstName,LastName,Email,Phone';

      const query = `SELECT ${fields} FROM Contact ${pagingString}`.trim();

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

      this.logger.log(`Synced Salesforce contacts!`);

      return {
        data: resp.data.records,
        message: 'Salesforce contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.log(`Error syncing Salesforce contacts: ${error.message}`);
      throw error;
    }
  }
}
