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
import { AttioTaskInput, AttioTaskOutput, paginationType } from './types';
import { v4 as uuidv4 } from 'uuid';

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

      const paginationTrackInfo = await this.prisma.vertical_objects_sync_track_data.findFirst({
        where: {
          id_connection: connection.id_connection,
          vertical: 'crm',
          provider_slug: 'attio',
          object: 'task',
        },
      });

      let respData: AttioTaskOutput[] = [];
      let initialOffset: number = 0;

      if (!paginationTrackInfo) {
        // Intial sync
        try {
          while (true) {
            const resp = await axios.get(
              `${connection.account_url}/v2/tasks?limit=500&offset=${initialOffset}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`,
                },
              });


            respData.push(...resp.data.data);
            initialOffset = initialOffset + resp.data.data.length;

            if (resp.data.data.length < 500) {
              break;
            }
          }
        }
        catch (error) {
          this.logger.log(`Error in initial sync ${error.message} and last offset is ${initialOffset}`);
        }

      }
      else {
        // Incremental sync
        const currentPaginationData = paginationTrackInfo.data as paginationType;
        initialOffset = currentPaginationData.offset;

        try {
          while (true) {
            const resp = await axios.get(
              `${connection.account_url}/v2/tasks?limit=500&offset=${initialOffset}`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`,
                },
              });

            respData.push(...resp.data.data);
            initialOffset = initialOffset + resp.data.data.length;

            if (resp.data.data.length < 500) {
              break;
            }
          }
        }
        catch (error) {
          this.logger.log(`Error in incremental sync ${error.message} and last offset is ${initialOffset}`);
        }
      }

      // create or update records
      if (paginationTrackInfo) {
        await this.prisma.vertical_objects_sync_track_data.update({
          where: {
            id_vertical_objects_sync_track_data: paginationTrackInfo.id_vertical_objects_sync_track_data,
          },
          data: {
            data: {
              offset: initialOffset,
            },
          },
        });
      }
      else {
        await this.prisma.vertical_objects_sync_track_data.create({
          data: {
            id_vertical_objects_sync_track_data: uuidv4(),
            vertical: 'crm',
            provider_slug: 'attio',
            object: 'task',
            pagination_type: 'offset',
            id_connection: connection.id_connection,
            data: {
              offset: initialOffset,
            },
          },
        });
      }

      return {
        data: respData,
        message: 'Attio tasks retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
