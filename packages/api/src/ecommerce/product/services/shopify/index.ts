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
import { ShopifyProductInput, ShopifyProductOutput } from './types';
import { EcommerceObject } from '@panora/shared';

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

  async addProduct(
    productData: ShopifyProductInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ShopifyProductOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'shopify',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.post(
        `${connection.account_url}/admin/api/2024-07/products.json`,
        {
          product: productData,
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
        data: resp.data.product,
        message: 'Shopify product created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
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
      const resp = await axios.get(
        `${connection.account_url}/admin/api/2024-07/products.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': this.cryptoService.decrypt(
              connection.access_token,
            ),
          },
        },
      );
      const products: ShopifyProductOutput[] = resp.data.products;
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
