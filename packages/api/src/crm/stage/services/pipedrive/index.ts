import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@lib/@types';
import { PipedriveStageOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

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

  async sync(data: SyncParam): Promise<ApiResponse<PipedriveStageOutput[]>> {
    try {
      const { linkedUserId, deal_id } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const res = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: deal_id as string },
      });

      const deals = await axios.get(`${connection.account_url}/v1/deals`, {
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
      const resp = await axios.get(`${connection.account_url}/v1/stages`, {
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
      throw error;
    }
  }
}
