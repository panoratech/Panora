import { ShopifyProductInput, ShopifyProductOutput } from './types';
import {
  UnifiedProductInput,
  UnifiedProductOutput,
} from '@ecommerce/product/types/model.unified';
import { IProductMapper } from '@ecommerce/product/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class ShopifyProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'product', 'ashby', this);
  }

  async desunify(
    source: UnifiedProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyProductInput> {
    return;
  }

  async unify(
    source: ShopifyProductOutput | ShopifyProductOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedProductOutput | UnifiedProductOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleProductToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ShopifyProductOutput
    return Promise.all(
      source.map((product) =>
        this.mapSingleProductToUnified(
          product,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleProductToUnified(
    product: ShopifyProductOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedProductOutput> {
    return {
      remote_id: product.id,
      remote_data: product,
    };
  }
}
