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
import { LeadSquaredTaskInput, LeadSquaredTaskOutput } from './types';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';

@Injectable()
export class LeadSquaredService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + LeadSquaredService.name,
    );
    this.registry.registerService('leadsquared', this);
  }

  async addTask(
    taskData: LeadSquaredTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<LeadSquaredTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });

      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/Task.svc/Create`,
        taskData,
        {
          headers,
        },
      );
      const taskId = resp.data['Message']['Id'];
      const taskResponse = await axios.get(
        `${connection.account_url}/v2/Task.svc/Retrieve.GetById?id=${taskId}`,
        {
          headers,
        },
      );
      return {
        data: taskResponse.data[0],
        message: 'Leadsquared task created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.task,
        ActionType.POST,
      );
      return {
        data: null,
        message: 'Failed to create Leadsquared task',
        statusCode: 500,
      };
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<LeadSquaredTaskOutput[]>> {
    try {
      const { linkedUserId, ownerEmailAddress, statusCode } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });

      const payload = {
        Parameter: {
          LookupName: 'ownerEmailAddress',
          LookupValue: ownerEmailAddress,
          StatusCode: statusCode, // 0 = incomplete, 1 = completed
        },
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/Task.svc/Retrieve`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-LSQ-AccessKey': this.cryptoService.decrypt(
              connection.access_token,
            ),
            'x-LSQ-SecretKey': this.cryptoService.decrypt(
              connection.secret_token,
            ),
          },
        },
      );
      this.logger.log(`Synced leadsquared tasks !`);
      return {
        data: resp.data['List'],
        message: 'Leadsquared tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.task,
        ActionType.POST,
      );
      return {
        data: [],
        message: 'Failed to retrieve Leadsquared tasks',
        statusCode: 500,
      };
    }
  }
}
