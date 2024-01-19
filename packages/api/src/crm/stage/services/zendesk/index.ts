import { Injectable } from '@nestjs/common';
import { IStageService } from '@crm/stage/types';
import { CrmObject, ZendeskStageOutput } from '@crm/@utils/@types';
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
      //TODO: check required scope  => crm.objects.stages.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
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
      const finalData = resp.data.items
        .filter((item) => item.data.stage_id === stage_remote_id)
        .map((item) => {
          return item.data;
        });
      this.logger.log(`Synced zendesk stages !`);

      return {
        data: [finalData],
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
