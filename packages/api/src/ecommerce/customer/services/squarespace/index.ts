import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { ICustomerService } from '@ecommerce/customer/types';
import { Injectable } from '@nestjs/common';
import { EcommerceObject } from '@panora/shared';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SquarespaceCustomerOutput } from './types';

@Injectable()
export class SquarespaceService implements ICustomerService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.customer.toUpperCase() + ':' + SquarespaceService.name,
    );
    this.registry.registerService('squarespace', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SquarespaceCustomerOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'squarespace',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.get(`${connection.account_url}/1.0/profiles`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const customers: SquarespaceCustomerOutput[] = resp.data.Profiles;
      this.logger.log(`Synced squarespace customers !`);

      return {
        data: customers,
        message: 'Squarespace customers retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
