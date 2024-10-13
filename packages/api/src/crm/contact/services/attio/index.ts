import { Injectable } from '@nestjs/common';
import { IContactService } from '@crm/contact/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { v4 as uuidv4 } from 'uuid';
import { AttioContactInput, AttioContactOutput, paginationType } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class AttioService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.contact.toUpperCase() + ':' + AttioService.name,
    );
    this.registry.registerService('attio', this);
  }

  async addContact(
    contactData: AttioContactInput,
    linkedUserId: string,
  ): Promise<ApiResponse<AttioContactOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'attio',
          vertical: 'crm',
        },
      });

      const resp = await axios.post(
        `${connection.account_url}/v2/objects/people/records`,
        JSON.stringify({
          data: contactData,
        }),
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
        message: 'attio contact created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<AttioContactOutput[]>> {
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
          object: 'contact',
        },
      });

      let respData: AttioContactOutput[] = [];
      let initialOffset: number = 0;

      if (!paginationTrackInfo) {
        // Intial sync
        try {
          while (true) {
            const resp = await axios.post(
              `${connection.account_url}/v2/objects/people/records/query`,
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
              `${connection.account_url}/v2/objects/people/records/query`,
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
            object: 'contact',
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
        message: 'Attio contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
