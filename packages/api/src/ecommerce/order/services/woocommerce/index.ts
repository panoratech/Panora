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
import { WoocommerceOrderInput, WoocommerceOrderOutput } from './types';

@Injectable()
export class WoocommerceService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.order.toUpperCase() + ':' + WoocommerceService.name,
    );
    this.registry.registerService('woocommerce', this);
  }

  async addOrder(
    orderData: WoocommerceOrderInput,
    linkedUserId: string,
  ): Promise<ApiResponse<WoocommerceOrderOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'woocommerce',
          vertical: 'ecommerce',
        },
      });
      const decryptedData = JSON.parse(
        this.cryptoService.decrypt(connection.access_token),
      );

      const { username, password } = decryptedData;

      const resp = await axios.post(
        `${connection.account_url}/v3/orders`,
        {
          order: orderData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${username}:${password}`,
            ).toString('base64')}`,
          },
        },
      );

      return {
        data: resp.data.order,
        message: 'Woocommerce order created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<WoocommerceOrderOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'woocommerce',
          vertical: 'ecommerce',
        },
      });
      const decryptedData = JSON.parse(
        this.cryptoService.decrypt(connection.access_token),
      );

      const { username, password } = decryptedData;

      const resp = await axios.get(`${connection.account_url}/v3/orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      });
      const orders: WoocommerceOrderOutput[] = resp.data;
      this.logger.log(`Synced woocommerce orders !`);

      return {
        data: orders,
        message: 'Woocommerce orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
