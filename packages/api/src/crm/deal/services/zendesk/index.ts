import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@utils/@types';
import { ZendeskDealInput, ZendeskDealOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addDeal(
    dealData: ZendeskDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm'
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/deals`,
        {
          data: dealData,
        },
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
        data: resp.data.data,
        message: 'Zendesk deal created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.deal,
        ActionType.POST,
      );
    }
    return;
  }

  async syncDeals(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskDealOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm'
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/deals`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk deals !`);

      return {
        data: finalData,
        message: 'Zendesk deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.deal,
        ActionType.GET,
      );
    }
  }
}
