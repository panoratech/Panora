import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@lib/@types';
import { CloseStageOutput, commonStageCloseProperties } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class CloseService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }

  async syncStages(
    linkedUserId: string,
    deal_id: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseStageOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const res = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: deal_id },
      });
      const baseURL = `${connection.account_url}/activity/status_change/opportunity/?opportunity_id=${res.remote_id}`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close stages !`);
      return {
        data: resp?.data?.data,
        message: 'Close stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Close',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
