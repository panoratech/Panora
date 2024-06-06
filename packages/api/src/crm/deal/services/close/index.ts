import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
<<<<<<< HEAD
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
=======
import { ActionType, handleServiceError } from '@@core/utils/errors';
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { CloseDealInput, CloseDealOutput } from './types';
@Injectable()
export class CloseService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + CloseService.name,
    );
    this.registry.registerService('close', this);
  }
  async addDeal(
    dealData: CloseDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<CloseDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
<<<<<<< HEAD
        `${connection.account_url}/opportunity`,
=======
        `${connection.account_url}/opportunity/`,
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
        JSON.stringify(dealData),
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
        data: resp?.data,
        message: 'Close deal created',
        statusCode: 201,
      };
    } catch (error) {
<<<<<<< HEAD
      handle3rdPartyServiceError(
=======
      handleServiceError(
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
        error,
        this.logger,
        'Close',
        CrmObject.deal,
        ActionType.POST,
      );
    }
  }

  async syncDeals(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<CloseDealOutput[]>> {
    try {
      //crm.schemas.deals.read","crm.objects.deals.read
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'close',
          vertical: 'crm',
        },
      });

      const baseURL = `${connection.account_url}/opportunity/`;
      const resp = await axios.get(baseURL, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced close deals !`);

      return {
        data: resp?.data?.data,
        message: 'Close deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
<<<<<<< HEAD
      handle3rdPartyServiceError(
=======
      handleServiceError(
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
        error,
        this.logger,
        'Close',
        CrmObject.deal,
        ActionType.GET,
      );
    }
  }
}
