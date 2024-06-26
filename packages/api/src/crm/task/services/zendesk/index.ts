import { Injectable } from '@nestjs/common';
import { ITaskService } from '@crm/task/types';
import { CrmObject } from '@crm/@lib/@types';
import { ZendeskTaskInput, ZendeskTaskOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addTask(
    taskData: ZendeskTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/tasks`,
        {
          data: taskData,
          meta: {
            type: 'task',
          },
        },
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
        data: resp.data.data,
        message: 'Zendesk task created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.task,
        ActionType.POST,
      );
    }
  }

  async syncTasks(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTaskOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`${connection.account_url}/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk tasks !`);

      return {
        data: finalData,
        message: 'Zendesk tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.task,
        ActionType.GET,
      );
    }
  }
}
