import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IEngagementService } from '@crm/engagement/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { PipedriveEngagementInput, PipedriveEngagementOutput } from './types';
import { Connection } from '@@core/connections/@utils/types';
@Injectable()
export class PipedriveService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addEngagement(
    engagementData: PipedriveEngagementInput,
    linkedUserId: string,
    engagement_type?: string,
  ): Promise<ApiResponse<PipedriveEngagementOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v1/activities`,
        JSON.stringify(engagementData),
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
        message: 'Pipedrive engagement created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<PipedriveEngagementOutput[]>> {
    try {
      const { connection, engagement_type } = data;

      switch (engagement_type as string) {
        case 'CALL':
          return this.syncCalls(connection);
        case 'MEETING':
          return this.syncMeetings(connection);
        case 'EMAIL':
          return this.syncEmails(connection);
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  private async syncCalls(connection: Connection) {
    try {
      const resp = await axios.get(`${connection.account_url}/v1/activities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      //filter only calls
      const finalData = resp.data.data.filter(
        (item) => item.key_string == 'call',
      );
      this.logger.log(`Synced pipedrive engagements calls !`);

      return {
        data: finalData,
        message: 'Pipedrive engagements calls retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
  private async syncMeetings(connection: Connection) {
    try {
      const resp = await axios.get(`${connection.account_url}/v1/activities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      //filter only calls
      const finalData = resp.data.data.filter(
        (item) => item.key_string == 'meeting',
      );
      this.logger.log(`Synced pipedrive engagements meetings !`);

      return {
        data: finalData,
        message: 'Pipedrive engagements meetings retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
  private async syncEmails(connection: Connection) {
    try {
      const resp = await axios.get(`${connection.account_url}/v1/activities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      //filter only calls
      const finalData = resp.data.data.filter(
        (item) => item.key_string == 'email',
      );
      this.logger.log(`Synced pipedrive engagements emails !`);

      return {
        data: finalData,
        message: 'Pipedrive engagements emails retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
