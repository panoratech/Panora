import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@lib/@types';
import { ZendeskDealInput, ZendeskDealOutput } from './types';
import axios from 'axios';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';
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
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/deals`,
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
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.deal,
        ActionType.POST,
      );
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ZendeskDealOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`${connection.account_url}/deals`, {
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
      handle3rdPartyServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.deal,
        ActionType.GET,
      );
    }
  }
}
