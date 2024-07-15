import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import { CrmObject } from '@crm/@lib/@types';
import { ZohoEngagementInput, ZohoEngagementOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

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
  //ONLY CALLS FOR ZOHO
  async addEngagement(
    engagementData: ZohoEngagementInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoEngagementOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/Campaigns`,
        { data: [engagementData] },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //this.logger.log('zoho resp is ' + JSON.stringify(resp));
      return {
        data: resp.data.data,
        message: 'Zoho engagement created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
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
        `${connection.account_url}/Calls?fields=${fields}`,
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
        `${connection.account_url}/Events?fields=${fields}`,
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
