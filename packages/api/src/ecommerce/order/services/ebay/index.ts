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
import { EbayOrderInput, EbayOrderOutput } from './types';

@Injectable()
export class EbayService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${EcommerceObject.order.toUpperCase()}:${EbayService.name}`,
    );
    this.registry.registerService('ebay', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<EbayOrderOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: data.linkedUserId,
          provider_slug: 'ebay',
          vertical: 'ecommerce',
        },
      });

      // ref: https://developer.ebay.com/api-docs/sell/fulfillment/resources/order/methods/getOrders
      const resp = await axios.get(
        `${connection.account_url}/sell/fulfillment/v1/order?offset=0&limit=200`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const orders: EbayOrderOutput[] = resp.data.orders;
      this.logger.log(`Synced ebay orders !`);

      return {
        data: orders,
        message: 'Ebay orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
