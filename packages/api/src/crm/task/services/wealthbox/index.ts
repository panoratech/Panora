import { Injectable } from '@nestjs/common';
import { ITaskService } from '@crm/task/types';
import { CrmObject } from '@crm/@lib/@types';
import {
  commonTaskWealthboxProperties,
  WealthboxTaskInput,
  WealthboxTaskOutput,
} from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface'; 

@Injectable()
export class WealthboxService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + WealthboxService.name,
    );
    this.registry.registerService("wealthbox", this)
  }

  async addTask(
    taskData: WealthboxTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<WealthboxTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_liked_user: linkedUserId,
          provider_slug: "wealthbox",
          vertical: "crm"
        }
      })

      const resp = await axios.post(`${connection.account_url}/v1/tasks`,
        JSON.stringify(taskData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      )

      return {
        data: resp.data,
        message: "Wealthbox task created",
        statusCode: 201,
      }
    } catch (error) {
      throw error
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<WealthboxTaskOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: "wealthbox",
          vertical: "crm",
        }
      })
      
      const commonPropertyNames = Object.keys(commonTaskWealthboxProperties);
      const allProperties = [...commonPropertyNames];
      const baseURL = `${connection.account_url}/v1/tasks`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced wealthbox tasks !`);

      return {
        data: resp.data.tasks,
        message: "Wealthbox tasks retrieved",
        statusCode: 200
      }
    } catch (error) {
      throw error
    }
  }
}