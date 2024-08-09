import { ShopifyProductInput, ShopifyProductOutput } from './types';
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
export class ShopifyProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'product',
      'shopify',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyProductInput> {
    const res: any = {
      title: source.description,
      body_html: source.description,
      vendor: source.vendor,
      product_type: source.product_type.toLowerCase(),
      status: source.product_status.toLowerCase(),
    };
    if (source.variants) {
      res.variants = source.variants.map((item) => ({
        option1: item.title,
        inventory_quantity: item.inventory_quantity,
        weight: item.weight,
        price: item.price,
        sku: item.sku,
      }));
    }

    return res;
  }

  async unify(
    source: ShopifyProductOutput | ShopifyProductOutput[],
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
  ): Promise<UnifiedEcommerceProductOutput> {
    return {
      remote_id: product.id?.toString(),
      remote_data: product,
      product_url: product.handle
        ? `https://example.com/products/${product.handle}`
        : undefined,
      product_type: product.product_type,
      product_status: product.status,
      images_urls: product.images?.map((image) => image.src),
      description: product.body_html,
      vendor: product.vendor,
      variants: product.variants?.map((variant) => ({
        title: variant.title,
        price: Number(variant.price),
        sku: variant.sku,
        options: variant.option1,
        weight: variant.weight,
        inventory_quantity: variant.inventory_quantity,
      })),
      tags: product.tags?.split(',').map((tag) => tag.trim()),
    };
  }
}
