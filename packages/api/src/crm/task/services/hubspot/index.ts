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
  HubspotTaskInput,
  HubspotTaskOutput,
  commonTaskHubspotProperties,
} from './types';

@Injectable()
export class HubspotService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addTask(
    taskData: HubspotTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/tasks`,
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
      const final_resp = await axios.get(
        `${connection.account_url}/crm/v3/objects/tasks/${resp.data.id}?properties=hs_task_body&associations=deal,company`,
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
        message: 'Hubspot task created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotTaskOutput[]>> {
    try {
      const { linkedUserId, custom_properties } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonTaskHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/crm/v3/objects/tasks`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}&associations=deal,company`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot tasks !`);

      return {
        data: resp.data.results,
        message: 'Hubspot tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
