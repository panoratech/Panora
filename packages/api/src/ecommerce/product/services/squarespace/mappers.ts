import { SquarespaceProductInput, SquarespaceProductOutput } from './types';
import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '@ecommerce/product/types/model.unified';
import { IProductMapper } from '@ecommerce/product/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class SquarespaceProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'product',
      'squarespace',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SquarespaceProductInput> {
    return;
  }

  async unify(
    source: SquarespaceProductOutput | SquarespaceProductOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceProductOutput | UnifiedEcommerceProductOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleProductToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of SquarespaceProductOutput
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
    product: SquarespaceProductOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceProductOutput> {
    return {
      remote_id: product.id?.toString(),
      remote_data: product,
      product_url: product.url,
      product_type: product.type?.toLowerCase(),
      product_status: product.isVisible ? 'ACTIVE' : 'ARCHIVED',
      images_urls: product.images?.map((image) => image.url),
      description: product.description,
      vendor: null,
      variants: product.variants?.map((variant) => ({
        title: variant.attributes.option1,
        price: Number(variant.pricing.basePrice.value),
        sku: variant.sku,
        options: variant.attributes,
        weight: variant.shippingMeasurements.weight.value,
        inventory_quantity: variant.stock.quantity,
      })),
      tags: product.tags,
    };
  }
}
