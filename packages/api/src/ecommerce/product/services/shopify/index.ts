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
import { ShopifyProductOutput } from './types';

@Injectable()
export class ShopifyService implements IProductService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.product.toUpperCase() + ':' + ShopifyService.name,
    );
    this.registry.registerService('shopify', this);
  }
  addProduct(
    productData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalProductOutput>> {
    throw new Error('Method not implemented.');
  }

  async sync(data: SyncParam): Promise<ApiResponse<ShopifyProductOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'shopify',
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
      const products: ShopifyProductOutput[] = resp.data.results;
      this.logger.log(`Synced shopify products !`);

      return {
        data: products,
        message: 'Shopify products retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
