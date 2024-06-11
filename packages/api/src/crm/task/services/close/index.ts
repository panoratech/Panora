import { Injectable } from '@nestjs/common';
import { ITaskService } from '@crm/task/types';
import { CrmObject } from '@crm/@lib/@types';
import { CloseTaskInput, CloseTaskOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class CloseService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }
  async addTask(
    taskData: CloseTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/task`,
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
      return {
        data: resp?.data,
        message: 'Close task created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.task,
        ActionType.POST,
      );
    }
  }

  async syncTasks(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseTaskOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/task`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close tasks !`);
      return {
        data: resp?.data?.data,
        message: 'Close tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.task,
        ActionType.GET,
      );
    }
  }
}
