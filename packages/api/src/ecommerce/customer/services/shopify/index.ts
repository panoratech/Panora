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
import { ShopifyCustomerOutput } from './types';

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
          provider_slug: 'shopify',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.get(
        `${connection.account_url}/admin/api/2024-07/customers.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );
      const customers: ShopifyCustomerOutput[] = resp.data.customers;
      this.logger.log(`Synced shopify customers !`);

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
