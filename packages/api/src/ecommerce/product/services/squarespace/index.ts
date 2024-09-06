import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalProductOutput } from '@@core/utils/types/original/original.ecommerce';
import { IProductService } from '@ecommerce/product/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { SquarespaceProductInput, SquarespaceProductOutput } from './types';
import { EcommerceObject } from '@panora/shared';

@Injectable()
export class SquarespaceService implements IProductService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.product.toUpperCase() + ':' + SquarespaceService.name,
    );
    this.registry.registerService('squarespace', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<SquarespaceProductOutput[]>> {
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
        `${connection.account_url}/1.1/commerce/products?type=PHYSICAL,DIGITAL`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const products: SquarespaceProductOutput[] = resp.data.products;
      this.logger.log(`Synced squarespace products !`);

      return {
        data: products,
        message: 'Squarespace products retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
