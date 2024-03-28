/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@utils/@types';
import { FreshsalesTaskInput, FreshsalesTaskOutput } from './types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ITaskService } from '@crm/task/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class FreshsalesService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async addTask(
    taskData: FreshsalesTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const dataBody = {
        task: taskData,
      };
      const resp = await axios.post(
        'https://domain.freshsales.io/api/tasks',
        JSON.stringify(dataBody),
        {
          headers: {
            Authorization: `Token token=${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data,
        message: 'Freshsales task created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.task,
        ActionType.POST,
      );
    }
  }

  async syncTasks(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesTaskOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://domain.freshsales.io/api/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data,
        message: 'Freshsales tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.task,
        ActionType.GET,
      );
    }
  }
}
