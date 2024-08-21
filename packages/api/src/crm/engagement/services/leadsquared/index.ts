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
  LeadSquaredEngagementCallInput,
  LeadSquaredEngagementEmailInput,
  LeadSquaredEngagementEmailOutput,
  LeadSquaredEngagementInput,
  LeadSquaredEngagementMeetingInput,
  LeadSquaredEngagementMeetingOutput,
  LeadSquaredEngagementOutput,
} from './types';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';

@Injectable()
export class LeadSquaredService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + LeadSquaredService.name,
    );
    this.registry.registerService('leadsquared', this);
  }

  formatDateForLeadSquared(date: Date): string {
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const currentDate = date.getUTCDate().toString().padStart(2, '0');
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${currentDate} ${hours}:${minutes}:${seconds}`;
  }

  async addEngagement(
    engagementData: LeadSquaredEngagementInput,
    linkedUserId: string,
    engagement_type: string,
  ): Promise<ApiResponse<LeadSquaredEngagementOutput>> {
    try {
      switch (engagement_type) {
        case 'CALL':
          return this.addCall(
            engagementData as LeadSquaredEngagementCallInput,
            linkedUserId,
          );
        case 'MEETING':
          return this.addMeeting(
            engagementData as LeadSquaredEngagementMeetingInput,
            linkedUserId,
          );
        case 'EMAIL':
          return this.addEmail(
            engagementData as LeadSquaredEngagementEmailInput,
            linkedUserId,
          );
        default:
          break;
      }
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  private async addCall(
    engagementData: LeadSquaredEngagementCallInput,
    linkedUserId: string,
  ): Promise<ApiResponse<any>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });

      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/Telephony.svc/LogCall`,
        engagementData,
        {
          headers,
        },
      );
      return {
        data: resp.data,
        message: 'LeadSquared call created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  private async addMeeting(
    engagementData: LeadSquaredEngagementMeetingInput,
    linkedUserId: string,
  ): Promise<ApiResponse<LeadSquaredEngagementMeetingOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });

      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/Task.svc/Create`,
        engagementData,
        {
          headers,
        },
      );
      const taskId = resp.data['Message']['Id'];
      const taskResponse = await axios.get(
        `${connection.account_url}/v2/Task.svc/Retrieve.GetById?id=${taskId}`,
        {
          headers,
        },
      );
      return {
        data: taskResponse.data[0],
        message: 'Leadsquared meeting created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  private async addEmail(
    engagementData: LeadSquaredEngagementEmailInput,
    linkedUserId: string,
  ): Promise<ApiResponse<LeadSquaredEngagementEmailOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/EmailMarketing.svc/SendEmailToLead`,
        engagementData,
        {
          headers,
        },
      );
      return {
        data: resp.data,
        message: 'LeadSquared email created',
        statusCode: 201,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  private async syncEmails(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });
      const headers = {
        'Content-Type': 'application/json',
        'x-LSQ-AccessKey': this.cryptoService.decrypt(connection.access_token),
        'x-LSQ-SecretKey': this.cryptoService.decrypt(connection.secret_token),
      };
      const fromDate = this.formatDateForLeadSquared(new Date(0));
      const toDate = this.formatDateForLeadSquared(new Date());
      const requestBody = {
        Parameter: {
          FromDate: fromDate,
          ToDate: toDate,
          EmailEvent: 'Sent',
        },
      };
      const resp = await axios.get(
        `${connection.account_url}/v2/EmailMarketing.svc/RetrieveSentEmails`,
        requestBody,
        {
          headers,
        },
      );
      this.logger.log(`Synced leadsquared emails engagements !`);
      return {
        data: resp.data['Records'],
        message: 'LeadSquared engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }

  private async syncMeetings(linkedUserId: string) {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'leadsquared',
          vertical: 'crm',
        },
      });

      const fromDate = this.formatDateForLeadSquared(new Date(0));
      const toDate = this.formatDateForLeadSquared(new Date());

      const payload = {
        FromDate: fromDate,
        ToDate: toDate,
        Users: [linkedUserId],
      };

      const resp = await axios.post(
        `${connection.account_url}/v2/Task.svc/RetrieveAppointments/ByUserId`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-LSQ-AccessKey': this.cryptoService.decrypt(
              connection.access_token,
            ),
            'x-LSQ-SecretKey': this.cryptoService.decrypt(
              connection.secret_token,
            ),
          },
        },
      );
      this.logger.log(`Synced leadsquared meetings !`);
      return {
        data: resp.data['List'],
        message: 'Leadsquared meetings retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<LeadSquaredEngagementOutput[]>> {
    try {
      const { linkedUserId, engagement_type } = data;

      switch (engagement_type as string) {
        // there was no any endpoint to sync calls
        // case 'CALL':
        //   return this.syncCalls(linkedUserId);
        case 'MEETING':
          return this.syncMeetings(linkedUserId);
        case 'EMAIL':
          return this.syncEmails(linkedUserId);

        default:
          break;
      }
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'leadsquared',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
