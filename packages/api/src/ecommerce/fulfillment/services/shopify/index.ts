import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalFulfillmentOutput } from '@@core/utils/types/original/original.ecommerce';
import { IFulfillmentService } from '@ecommerce/fulfillment/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { ShopifyFulfillmentOutput } from './types';
import { EcommerceObject } from '@panora/shared';

@Injectable()
export class ShopifyService implements IFulfillmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.fulfillment.toUpperCase() + ':' + ShopifyService.name,
    );
    this.registry.registerService('shopify', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<ShopifyFulfillmentOutput[]>> {
    try {
      const { linkedUserId, id_order } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'shopify',
          vertical: 'ecommerce',
        },
      });
      //retrieve ticket remote id so we can retrieve the comments in the original software
      const order = await this.prisma.ecom_orders.findUnique({
        where: {
          id_ecom_order: id_order as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/admin/api/2024-07/orders/${order.remote_id}/fulfillments.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );
      const fulfillments: ShopifyFulfillmentOutput[] = resp.data.fulfillments;
      this.logger.log(`Synced shopify fulfillments !`);

      return {
        data: fulfillments,
        message: 'Shopify fulfillments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
