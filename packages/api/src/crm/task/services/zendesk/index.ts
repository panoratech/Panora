import { Injectable } from '@nestjs/common';
import { ITaskService } from '@crm/task/types';
import { CrmObject } from '@crm/@utils/@types';
import { ZendeskTaskInput, ZendeskTaskOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { OriginalTaskOutput } from '@@core/utils/types/original/original.crm';
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
        },
      });

      const resp = await axios.post(
        `https://api.getbase.com/v2/tasks`,
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
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.task,
        ActionType.POST,
      );
    }
    return;
  }

  async syncTasks(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskTaskOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/tasks`, {
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
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.task,
        ActionType.GET,
      );
    }
  }
}
