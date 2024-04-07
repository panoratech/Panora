import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@utils/@types';
import { PipedriveDealInput, PipedriveDealOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.deal.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addDeal(
    dealData: PipedriveDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/deals`,
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
        data: resp.data.data,
        message: 'Pipedrive deal created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.deal,
        ActionType.POST,
      );
    }
    return;
  }

  async syncDeals(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveDealOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
          vertical: 'crm',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/deals`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive deals retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.deal,
        ActionType.GET,
      );
    }
  }
}
