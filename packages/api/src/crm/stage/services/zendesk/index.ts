import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject } from '@crm/@utils/@types';
import { ZendeskStageOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements IStageService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.stage.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async syncStages(
    linkedUserId: string,
    deal_id: string,
  ): Promise<ApiResponse<ZendeskStageOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm'
        },
      });
      const res = await this.prisma.crm_deals.findUnique({
        where: { id_crm_deal: deal_id },
      });
      const deal = await axios.get(
        `https://api.getbase.com/v2/deals/${res.remote_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const stage_remote_id: number = deal.data.data.stage_id;
      const resp = await axios.get(`https://api.getbase.com/v2/stages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const finalData = resp.data.items.find(
        (item) => item.data.id === stage_remote_id,
      );

      this.logger.log(`Synced zendesk stages !`);

      return {
        data: [finalData.data],
        message: 'Zendesk stages retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.stage,
        ActionType.GET,
      );
    }
  }
}
