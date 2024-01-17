import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import {
  CrmObject,
  HubspotStageInput,
  HubspotStageOutput,
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
export class HubspotService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + HubspotService.name,
    );
    this.registry.registerService('hubspot', this);
  }
  async addStage(
    stageData: HubspotStageInput,
    linkedUserId: string,
  ): Promise<ApiResponse<HubspotStageOutput>> {
    try {
      //TODO: check required scope  => crm.objects.stages.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });
      const dataBody = {
        properties: stageData,
      };
      const resp = await axios.post(
        `https://api.hubapi.com/crm/v3/objects/stages/`,
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
        message: 'Hubspot stage created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.stage,
        ActionType.POST,
      );
    }
  }

  async syncStages(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotStageOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.stages.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
        },
      });

      const commonPropertyNames = Object.keys(commonHubspotProperties);
      const allProperties = [...commonPropertyNames, ...custom_properties];
      const baseURL = 'https://api.hubapi.com/crm/v3/objects/stages/';

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
      this.logger.log(`Synced hubspot stages !`);

      return {
        data: resp.data.results,
        message: 'Hubspot stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
