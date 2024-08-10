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
import { ZendeskEngagementInput, ZendeskEngagementOutput } from './types';
@Injectable()
export class ZendeskService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  //ONLY CALLS FOR ZENDESK
  async addEngagement(
    engagementData: ZendeskEngagementInput,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<ZendeskEngagementOutput>> {
    try {
      switch (engagement_type) {
        case 'CALL':
          return this.addCall(engagementData, linkedUserId);
        case 'MEETING':
          return;
        case 'EMAIL':
          return;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }
  private async addCall(
    engagementData: ZendeskEngagementInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskEngagementOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/v2/calls`,
        {
          data: engagementData,
        },
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
        message: 'Zendesk engagement call created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskEngagementOutput[]>> {
    try {
      const { linkedUserId, engagement_type } = data;

      switch (engagement_type as string) {
        case 'CALL':
          return this.syncCalls(linkedUserId);
        case 'MEETING':
          return;
        case 'EMAIL':
          return;
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  private async syncCalls(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });

      const resp = await axios.get(`${connection.account_url}/v2/calls`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk engagements calls !`);

      return {
        data: finalData,
        message: 'Zendesk deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
