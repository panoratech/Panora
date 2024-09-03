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
  HubspotEngagementCallInput,
  HubspotEngagementCallOutput,
  HubspotEngagementEmailInput,
  HubspotEngagementEmailOutput,
  HubspotEngagementInput,
  HubspotEngagementMeetingInput,
  HubspotEngagementMeetingOutput,
  HubspotEngagementOutput,
  commonCallHubspotProperties,
  commonEmailHubspotProperties,
  commonMeetingHubspotProperties,
} from './types';

@Injectable()
export class HubspotService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addEngagement(
    engagementData: HubspotEngagementInput,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<HubspotEngagementOutput>> {
    try {
      switch (engagement_type) {
        case 'CALL':
          return this.addCall(
            engagementData as HubspotEngagementCallInput,
            linkedUserId,
          );
        case 'MEETING':
          return this.addMeeting(
            engagementData as HubspotEngagementMeetingInput,
            linkedUserId,
          );
        case 'EMAIL':
          return this.addEmail(
            engagementData as HubspotEngagementEmailInput,
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
    engagementData: HubspotEngagementCallInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotEngagementCallOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: engagementData,
      };
      const resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/calls`,
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
        data: resp.data,
        message: 'Hubspot call created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  private async addMeeting(
    engagementData: HubspotEngagementMeetingInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotEngagementMeetingOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: engagementData,
      };
      const resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/meetings`,
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
        data: resp.data,
        message: 'Hubspot meeting created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  private async addEmail(
    engagementData: HubspotEngagementEmailInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotEngagementEmailOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      const dataBody = {
        properties: engagementData,
      };
      const resp = await axios.post(
        `${connection.account_url}/crm/v3/objects/emails`,
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
        data: resp.data,
        message: 'Hubspot email created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<HubspotEngagementOutput[]>> {
    try {
      const { linkedUserId, custom_properties, engagement_type } = data;

      switch (engagement_type as string) {
        case 'CALL':
          return this.syncCalls(linkedUserId, custom_properties);
        case 'MEETING':
          return this.syncMeetings(linkedUserId, custom_properties);
        case 'EMAIL':
          return this.syncEmails(linkedUserId, custom_properties);
        default:
          break;
      }
    } catch (error) {
      throw error;
    }
  }

  private async syncCalls(linkedUserId: string, custom_properties?: string[]) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonCallHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/crm/v3/objects/call`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot engagements calls !`);

      return {
        data: resp.data.results,
        message: 'Hubspot engagements calls retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  private async syncMeetings(
    linkedUserId: string,
    custom_properties?: string[],
  ) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonMeetingHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/crm/v3/objects/meeting`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot engagements meetings !`);

      return {
        data: resp.data.results,
        message: 'Hubspot engagements meetings retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }

  private async syncEmails(linkedUserId: string, custom_properties?: string[]) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });

      const commonPropertyNames = Object.keys(commonEmailHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = `${connection.account_url}/crm/v3/objects/emails`;

      const queryString = allProperties
        .map((prop) => `properties=${encodeURIComponent(prop)}`)
        .join('&');

      const url = `${baseURL}?${queryString}`;

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot engagements emails !`);

      return {
        data: resp.data.results,
        message: 'Hubspot engagements emails retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
