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
import { WoocommerceProductInput, WoocommerceProductOutput } from './types';
import { EcommerceObject } from '@panora/shared';

@Injectable()
export class WoocommerceService implements IProductService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      EcommerceObject.product.toUpperCase() + ':' + WoocommerceService.name,
    );
    this.registry.registerService('woocommerce', this);
  }

  async addProduct(
    productData: WoocommerceProductInput,
    linkedUserId: string,
  ): Promise<ApiResponse<WoocommerceProductOutput>> {
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
        `${connection.account_url}/v3/products`,
        {
          product: productData,
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
        data: resp.data,
        message: 'Woocommerce product created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<WoocommerceProductOutput[]>> {
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

      const resp = await axios.get(`${connection.account_url}/v3/products`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString('base64')}`,
        },
      });
      const products: WoocommerceProductOutput[] = resp.data;
      this.logger.log(`Synced woocommerce products !`);

      return {
        data: products,
        message: 'Woocommerce products retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
