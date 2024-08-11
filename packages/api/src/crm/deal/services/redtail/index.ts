import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { IDealService } from '@crm/opportunity/types';
import { CrmObject } from '@crm/@lib/@types';
import { RedtailDealInput, RedtailDealOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class RedtailService implements IDealService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
         `${CrmObject.opportunity.toUpperCase()}:${RedtailService.name}`,
       );
    this.registry.registerService('redtail', this);
  }

  private getBasicAuthHeader(username: string, password: string, apiKey: string): string {
    const credentials = `${apiKey}:${username}:${password}`;
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  async addDeal(
    opportunityData: RedtailDealInput,
    linkedUserId: string,
  ): Promise<ApiResponse<RedtailDealOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'redtail',
          vertical: 'crm',
        },
      });

      const authHeader = this.getBasicAuthHeader(
        connection.username, // assuming these fields exist
        connection.password,
        connection.api_key,
      );

      const resp = await axios.post(
        `${connection.account_url}/opportunities`,
        JSON.stringify(opportunityData),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        },
      );
      return {
        data: resp.data.data,
        message: 'Redtail deal created',
        statusCode: 201,
      };
    } catch (error) {
      this.logger.error(`Error adding deal: ${error.message}`);
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<RedtailDealOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'redtail',
          vertical: 'crm',
        },
      });

      const authHeader = this.getBasicAuthHeader(
        connection.username, 
        connection.password,
        connection.api_key,
      );

      const resp = await axios.get(`${connection.account_url}/opportunities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });

      return {
        data: resp.data.data,
        message: 'Redtail deal retrieved',
        statusCode: 200,
      };
    } catch (error) {
      this.logger.error(`Error syncing deals: ${error.message}`);
      throw error;
    }
  }
}
