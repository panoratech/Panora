import { Injectable } from '@nestjs/common';
import { ICompanyService } from '@crm/company/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import {
    commonSalesforceCompanyProperties,
    SalesforceCompanyInput,
    SalesforceCompanyOutput,
  } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class SalesforceService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addCompany(
    companyData: SalesforceCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceCompanyOutput>> {
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
        `${instanceUrl}/services/data/v56.0/sobjects/Account/`,
        JSON.stringify(companyData),
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
        message: 'Salesforce company created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceCompanyOutput[]>> {
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

      const commonPropertyNames = Object.keys(commonSalesforceCompanyProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const fields = allProperties.join(',');

      const query = `SELECT ${fields} FROM Account ${pagingString}`;

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

      this.logger.log(`Synced Salesforce companies!`);

      return {
        data: resp.data.records,
        message: 'Salesforce companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}