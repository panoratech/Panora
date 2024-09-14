import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { ITaskService } from '@crm/task/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import {
  SalesforceTaskInput,
  SalesforceTaskOutput,
  commonTaskSalesforceProperties,
} from './types';

@Injectable()
export class SalesforceService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + SalesforceService.name,
    );
    this.registry.registerService('salesforce', this);
  }

  async addTask(
    taskData: SalesforceTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<SalesforceTaskOutput>> {
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
        `${instanceUrl}/services/data/v56.0/sobjects/Task/`,
        JSON.stringify(taskData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // Fetch the created task to get all details
      const taskId = resp.data.id;
      const final_resp = await axios.get(
        `${instanceUrl}/services/data/v56.0/sobjects/Task/${taskId}`,
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
        message: 'Salesforce task created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<SalesforceTaskOutput[]>> {
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

      const commonPropertyNames = Object.keys(commonTaskSalesforceProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const fields = allProperties.join(',');

      const query = `SELECT ${fields} FROM Task ${pagingString}`;

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

      this.logger.log(`Synced Salesforce tasks!`);

      return {
        data: resp.data.records,
        message: 'Salesforce tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}