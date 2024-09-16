/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { AttioCompanyInput, AttioCompanyOutput, paginationType } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttioService implements ICompanyService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.company.toUpperCase() + ':' + AttioService.name,
    );
    this.registry.registerService('attio', this);
  }
  async addCompany(
    companyData: AttioCompanyInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AttioCompanyOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/v2/objects/companies/records`,
        JSON.stringify({
          data: companyData,
        }),
        {
          headers: {
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Attio company created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<AttioCompanyOutput[]>> {
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
          object: 'company',
        },
      });

      let respData: AttioCompanyOutput[] = [];
      let initialOffset: number = 0;

      if (!paginationTrackInfo) {
        // Intial sync
        try {
          while (true) {
            const resp = await axios.post(
              `${connection.account_url}/v2/objects/companies/records/query`,
              {
                "sorts": [
                  {
                    "attribute": "created_at",
                    "direction": "asc"
                  }
                ],
                "offset": initialOffset,
                "limit": 500
              },
              {
                headers: {
                  accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`,
                },
              },
            );


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
            const resp = await axios.post(
              `${connection.account_url}/v2/objects/companies/records/query`,
              {
                "sorts": [
                  {
                    "attribute": "created_at",
                    "direction": "asc"
                  }
                ],
                "offset": initialOffset,
                "limit": 500
              },
              {
                headers: {
                  accept: 'application/json',
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.cryptoService.decrypt(
                    connection.access_token,
                  )}`
                }
              }
            );

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
            object: 'company',
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
        message: 'Attio companies retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
