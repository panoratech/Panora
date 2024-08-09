import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@lib/@types';
import { WealthboxStageOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class WealthboxService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(CrmObject.stage.toUpperCase() + ':' + WealthboxService.name
  )
    this.registry.registerService('hubspot', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<WealthboxStageOutput[]>> {
    try {
      const { linkedUserId, deal_id } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'wealthbox',
          vertical: 'crm',
        },
      });

      const res = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: deal_id as string },
      });
      const baseURL = `${connection.account_url}/v1/opportunities/?resource_id=${res.remote_id}`;

      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced wealthbox stages !`);
      return {
        data: resp?.data?.opportunities,
        message: 'wealthbox stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}