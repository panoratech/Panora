import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import {
  CrmObject,
  PipedriveEngagementInput,
  PipedriveEngagementOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

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

  /*TODO: */
  async addEngagement(
    engagementData: PipedriveEngagementInput,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<PipedriveEngagementOutput>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      return;
      /*return {
        data: resp.data.data,
        message: 'Pipedrive engagement created',
        statusCode: 201,
      };*/
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  async syncEngagements(
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<PipedriveEngagementOutput[]>> {
    try {
      switch (engagement_type) {
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
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }

  private async syncCalls(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });

      const resp = await axios.get(`https://api.pipedrive.com/v1/activities`, {
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
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement_call,
        ActionType.GET,
      );
    }
  }
  private async syncMeetings(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });

      const resp = await axios.get(`https://api.pipedrive.com/v1/activities`, {
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
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement_meeting,
        ActionType.GET,
      );
    }
  }
  private async syncEmails(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });

      const resp = await axios.get(`https://api.pipedrive.com/v1/activities`, {
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
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.engagement_email,
        ActionType.GET,
      );
    }
  }
}
