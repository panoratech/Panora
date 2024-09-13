import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IDealService } from '@crm/deal/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  SalesforceDealInput,
  SalesforceDealOutput,
  commonDealSalesforceProperties,
} from './types';

@Injectable()
export class SalesforceService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addDeal(
    dealData: SalesforceDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceDealOutput>> {
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
        `${instanceUrl}/services/data/v56.0/sobjects/Opportunity/`,
        JSON.stringify(dealData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Created Salesforce deal!`);

      return {
        data: resp.data,
        message: 'Salesforce deal created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceDealOutput[]>> {
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
      let pagingString = `${pageSize ? `ORDER BY Id DESC LIMIT ${pageSize} ` : ''}${
        cursor ? `OFFSET ${cursor}` : ''
      }`;
      if (!pageSize && !cursor) {
        pagingString = 'LIMIT 200';
      }

      const commonPropertyNames = Object.keys(commonDealSalesforceProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const fields = allProperties.join(',');

      const query = `SELECT ${fields} FROM Opportunity ${pagingString}`;

      const resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/query/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.logger.log(`Synced Salesforce deals!`);

      return {
        data: resp.data.records,
        message: 'Salesforce deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}