import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import {
  CrmObject,
  HubspotEngagementInput,
  HubspotEngagementOutput,
  commonHubspotProperties,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

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
  ): Promise<ApiResponse<HubspotEngagementOutput>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });
      const dataBody = {
        properties: engagementData,
      };
      const resp = await axios.post(
        `https://api.hubapi.com/crm/v3/objects/engagements`,
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
        message: 'Hubspot engagement created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
  }

  async syncEngagements(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotEngagementOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });

      const commonPropertyNames = Object.keys(commonHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = 'https://api.hubapi.com/crm/v3/objects/engagements/';

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
      this.logger.log(`Synced hubspot engagements !`);

      return {
        data: resp.data.results,
        message: 'Hubspot engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
