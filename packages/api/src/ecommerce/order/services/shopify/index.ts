import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { IOrderService } from '@ecommerce/order/types';
import { Injectable } from '@nestjs/common';
import { EcommerceObject } from '@panora/shared';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { ShopifyOrderInput, ShopifyOrderOutput } from './types';

@Injectable()
export class ShopifyService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.order.toUpperCase() + ':' + ShopifyService.name,
    );
    this.registry.registerService('shopify', this);
  }

  async addOrder(
    orderData: ShopifyOrderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ShopifyOrderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'shopify',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/admin/api/2024-07/orders.json`,
        {
          order: orderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );

      return {
        data: resp.data.orders,
        message: 'Shopify order created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<ShopifyOrderOutput[]>> {
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
        `${connection.account_url}/admin/api/2024-07/orders.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );
      const orders: ShopifyOrderOutput[] = resp.data.orders;
      this.logger.log(`Synced shopify orders !`);

      return {
        data: orders,
        message: 'Shopify orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
