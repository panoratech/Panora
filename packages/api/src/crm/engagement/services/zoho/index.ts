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
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  async syncEngagements(
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoEngagementOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
          vertical: 'crm',
        },
      });
      const fields =
        'Owner,Description,Campaign_Name,End_Date,Start_Date,Type,Created_By';
      const resp = await axios.get(
        `${connection.account_url}/Campaigns?fields=${fields}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Zoho-oauthtoken ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      //this.logger.log('CONTACTS ZOHO ' + JSON.stringify(resp.data.data));
      this.logger.log(`Synced zoho engagements !`);
      return {
        data: resp.data.data,
        message: 'Zoho engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
