import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@utils/@types';
import { PipedriveStageOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async syncStages(
    linkedUserId: string,
    deal_id: string,
  ): Promise<ApiResponse<PipedriveStageOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm'
        },
      });
      const res = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: deal_id },
      });

      const deals = await axios.get(`https://api.pipedrive.com/v1/deals`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const deal = deals.data.data.find(
        (item) => String(item.id) === res.remote_id,
      );
      const resp = await axios.get(`https://api.pipedrive.com/v1/stages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const remote_stage_id: number = deal.stage_id;
      //filter stages for the specific deal_id
      const finalRes = resp.data.data.find(
        (item) => item.id === remote_stage_id,
      );
      return {
        data: [finalRes],
        message: 'Pipedrive stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
