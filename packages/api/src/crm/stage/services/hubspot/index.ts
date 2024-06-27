import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@lib/@types';
import { HubspotStageOutput, commonStageHubspotProperties } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
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

  async syncStages(
    linkedUserId: string,
    deal_id: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<HubspotStageOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'hubspot',
          vertical: 'crm',
        },
      });
      // get all stages for all deals
      const url = 'https://api.hubapi.com/crm-pipelines/v1/pipelines/deals';

      const resp = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced hubspot stages !`);
      const final_res = resp.data.results.stages;

      return {
        data: final_res,
        message: 'Hubspot stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Hubspot',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
