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
import { ZohoEngagementOutput } from './types';

@Injectable()
export class ZohoService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + ZohoService.name,
    );
    this.registry.registerService('zoho', this);
  }

  private async syncCalls(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const fields =
        'Owner,Description,Campaign_Name,End_Date,Start_Date,Type,Created_By,Subject,Call_Type,Who_Id, Call_Start_Time, Call_Duration';
      const resp = await axios.get(
        `${connection.account_url}/v5/Calls?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zoho calls engagements !`);
      return {
        data: resp.data.data,
        message: 'Zoho engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  private async syncMeetings(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const fields =
        'Owner,Description,End_DateTime,Start_DateTime,Subject,What_Id,Who_Id,Participants,Event_Title';
      const resp = await axios.get(
        `${connection.account_url}/v5/Events?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zoho meetings engagements !`);
      return {
        data: resp.data.data,
        message: 'Zoho engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZohoEngagementOutput[]>> {
    try {
      const { linkedUserId, engagement_type } = data;

      switch (engagement_type as string) {
        case 'CALL':
          return this.syncCalls(linkedUserId);
        case 'MEETING':
          return this.syncMeetings(linkedUserId);
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }
}
