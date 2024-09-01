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
import { WebflowOrderInput, WebflowOrderOutput } from './types';

@Injectable()
export class WebflowService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${EcommerceObject.order.toUpperCase()}:${WebflowService.name}`,
    );
    this.registry.registerService('webflow', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<WebflowOrderOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: data.linkedUserId,
          provider_slug: 'webflow',
          vertical: 'ecommerce',
        },
      });

      // ref: https://docs.developers.webflow.com/data/reference/list-orders
      const resp = await axios.get(`${connection.account_url}/orders`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const orders: WebflowOrderOutput[] = resp.data.orders;
      this.logger.log(`Synced webflow orders !`);

      return {
        data: orders,
        message: 'Webflow orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
