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
import { AttioTaskInput, AttioTaskOutput } from './types';

@Injectable()
export class AttioService implements ITaskService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.task.toUpperCase() + ':' + AttioService.name,
    );
    this.registry.registerService('attio', this);
  }

  async addTask(
    taskData: AttioTaskInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AttioTaskOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v2/tasks`,
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
      const linked_records = await Promise.all(
        resp.data.data.linked_records.map(async (record) => {
          const res = await axios.get(
            `${connection.account_url}/objects/${record.target_object_id}`,
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
            target_object_id: res.data.data.api_slug,
            target_record_id: record.target_record_id,
          };
        }),
      );

      resp.data.data.linked_records = linked_records;
      return {
        data: resp?.data.data,
        message: 'Attio task created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<AttioTaskOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/v2/tasks`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced attio tasks !`);
      return {
        data: resp?.data?.data,
        message: 'Attio tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
