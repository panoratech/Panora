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
import {
  CloseEngagementCallInput,
  CloseEngagementCallOutput,
  CloseEngagementEmailInput,
  CloseEngagementEmailOutput,
  CloseEngagementInput,
  CloseEngagementMeetingInput,
  CloseEngagementMeetingOutput,
  CloseEngagementOutput,
} from './types';

@Injectable()
export class CloseService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }

  async addEngagement(
    engagementData: CloseEngagementInput,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<CloseEngagementOutput>> {
    try {
      switch (engagement_type) {
        case 'CALL':
          return this.addCall(
            engagementData as CloseEngagementCallInput,
            linkedUserId,
          );
        case 'MEETING':
          return this.addMeeting(
            engagementData as CloseEngagementMeetingInput,
            linkedUserId,
          );
        case 'EMAIL':
          return this.addEmail(
            engagementData as CloseEngagementEmailInput,
            linkedUserId,
          );
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  private async addCall(
    engagementData: CloseEngagementCallInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseEngagementCallOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/activity/call`,
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
        data: resp?.data,
        message: 'Close call created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  private async addMeeting(
    engagementData: CloseEngagementMeetingInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseEngagementMeetingOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/activity/meeting`,
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
        data: resp?.data,
        message: 'Close meeting created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  private async addEmail(
    engagementData: CloseEngagementEmailInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseEngagementEmailOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: engagementData,
      };
      const resp = await axios.post(
        `${connection.account_url}/activity/email`,
        JSON.stringify(dataBody),
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
        data: resp?.data,
        message: 'Close email created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<CloseEngagementOutput[]>> {
    try {
      const { linkedUserId, engagement_type } = data;

      switch (engagement_type as string) {
        case 'CALL':
          return this.syncCalls(linkedUserId);
        case 'MEETING':
          return this.syncMeetings(linkedUserId);
        case 'EMAIL':
          return this.syncEmails(linkedUserId);
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
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/activity/call`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close engagements calls !`);

      return {
        data: resp?.data?.data || [],
        message: 'Close engagements calls retrieved',
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
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/activity/meeting`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close engagements meetings !`);
      return {
        data: resp?.data?.data,
        message: 'Close engagements meetings retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  private async syncEmails(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/activity/email`;
      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close engagements emails !`);
      return {
        data: resp?.data?.data,
        message: 'Close engagements emails retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
