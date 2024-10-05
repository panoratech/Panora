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
import { EbayProductInput, EbayProductOutput } from './types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';

@Injectable()
export class EbayService implements IProductService {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly prismaService: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly serviceRegistry: ServiceRegistry,
  ) {
    this.loggerService.setContext(
      `${EcommerceObject.product.toUpperCase()}:${EbayService.name}`,
    );
    this.serviceRegistry.registerService('ebay', this);
  }

  async addProduct(
    productData: EbayProductInput,
    linkedUserId: string,
  ): Promise<ApiResponse<EbayProductOutput>> {
    try {
      const connection = await this.prismaService.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ebay',
          vertical: 'ecommerce',
        },
      });

      const { sku } = productData;
      // ref: https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/createOrReplaceInventoryItem
      const resp = await axios.put(
        `${connection.account_url}/sell/inventory/v1/inventory_item/${sku}`,
        productData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.encryptionService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      // Fetch the created product (not returned in above call)
      // ref: https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItem
      const productOutput = await axios.get(
        `${connection.account_url}/sell/inventory/v1/inventory_item/${sku}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.encryptionService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: productOutput.data as EbayProductOutput,
        message: 'Ebay product created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }
  async sync(data: SyncParam): Promise<ApiResponse<EbayProductOutput[]>> {
    try {
      const { linkedUserId } = data;

      const connection = await this.prismaService.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ebay',
          vertical: 'ecommerce',
        },
      });

      // ref: https://developer.ebay.com/api-docs/sell/inventory/resources/inventory_item/methods/getInventoryItems
      const resp = await axios.get(
        `${connection.account_url}/sell/inventory/v1/inventory_item?limit=200&offset=0`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.encryptionService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      this.loggerService.log(`Synced ebay inventory items !`);

      return {
        data: resp.data.inventoryItems as EbayProductOutput[],
        message: 'Ebay products fetched',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
