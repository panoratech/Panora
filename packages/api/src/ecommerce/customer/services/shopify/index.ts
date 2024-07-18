import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalCustomerOutput } from '@@core/utils/types/original/original.ecommerce';
import { ICustomerService } from '@ecommerce/customer/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { ShopifyCustomerOutput } from './types';
import { EcommerceObject } from '@panora/shared';

@Injectable()
export class ShopifyService implements ICustomerService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.customer.toUpperCase() + ':' + ShopifyService.name,
    );
    this.registry.registerService('shopify', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<ShopifyCustomerOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/departement.list`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${this.cryptoService.decrypt(connection.access_token)}:`,
            ).toString('base64')}`,
          },
        },
      );
      const customers: ShopifyCustomerOutput[] = resp.data.results;
      this.logger.log(`Synced ashby customers !`);

      return {
        data: customers,
        message: 'Shopify customers retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
