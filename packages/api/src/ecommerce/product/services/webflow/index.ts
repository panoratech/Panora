import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { IProductService } from '@ecommerce/product/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { EcommerceObject } from '@panora/shared';
import { WebflowProductInput, WebflowProductOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalProductOutput } from '@@core/utils/types/original/original.ecommerce';

@Injectable()
export class WebflowService implements IProductService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      `${EcommerceObject.product.toUpperCase()}:${WebflowService.name}`,
    );
    this.registry.registerService('webflow', this);
  }

  async addProduct(
    productData: WebflowProductInput,
    linkedUserId: string,
  ): Promise<ApiResponse<WebflowProductOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'webflow',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.post(
        // https://api.webflow.com/v2/sites/{site_id}/products
        `${connection.account_url}/products`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: resp.data,
        message: 'Webflow product created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<WebflowProductOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'webflow',
          vertical: 'ecommerce',
        },
      });
      const resp = await axios.get(
        // https://api.webflow.com/v2/sites/{site_id}/products
        `${connection.account_url}/products`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      const products: WebflowProductOutput[] = resp.data.items;
      this.logger.log(`Synced webflow products !`);

      return {
        data: products,
        message: 'Webflow products retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
