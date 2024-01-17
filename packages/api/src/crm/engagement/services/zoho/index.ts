import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import {
  CrmObject,
  ZohoEngagementInput,
  ZohoEngagementOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
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
      //TODO: check required scope  => crm.objects.engagements.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
        },
      });
      const resp = await axios.post(
        `https://www.zohoapis.eu/crm/v3/Engagements`,
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
      handleServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
    return;
  }

  async syncEngagements(
    linkedUserId: string,
  ): Promise<ApiResponse<ZohoEngagementOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zoho',
        },
      });
      //TODO: handle fields
      const fields = 'First_Name,Last_Name,Full_Name,Email,Phone';
      const resp = await axios.get(
        `https://www.zohoapis.eu/crm/v3/Engagements?fields=${fields}`,
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
      handleServiceError(
        error,
        this.logger,
        'Zoho',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
