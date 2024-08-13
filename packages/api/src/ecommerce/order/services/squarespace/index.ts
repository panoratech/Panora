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
import { SquarespaceOrderInput, SquarespaceOrderOutput } from './types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SquarespaceService implements IOrderService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.order.toUpperCase() + ':' + SquarespaceService.name,
    );
    this.registry.registerService('squarespace', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<SquarespaceOrderOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'squarespace',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.get(
        `${connection.account_url}/1.0/commerce/orders`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const orders: SquarespaceOrderOutput[] = resp.data.result;
      this.logger.log(`Synced squarespace orders !`);

      return {
        data: orders,
        message: 'Squarespace orders retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
