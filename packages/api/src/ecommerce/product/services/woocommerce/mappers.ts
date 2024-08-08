import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '@ecommerce/product/types/model.unified';
import { IProductMapper } from '@ecommerce/product/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { WoocommerceProductInput, WoocommerceProductOutput } from './types';

@Injectable()
export class WoocommerceProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'product',
      'woocommerce',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<Partial<WoocommerceProductInput>> {
    const res: Partial<WoocommerceProductInput> = {
      name: source.product_url?.split('/').pop() || '',
      description: source.description,
      short_description: source.description?.substring(0, 100),
      type: source.product_type as any,
      status: source.product_status?.toLowerCase() as any,
      featured: false,
      catalog_visibility: 'visible',
      sku: source.variants?.[0]?.sku,
      price: source.variants?.[0]?.price.toString(),
      regular_price: source.variants?.[0]?.price.toString(),
      sale_price: '',
      virtual: false,
      downloadable: false,
      manage_stock: true,
      stock_quantity: source.variants?.[0]?.inventory_quantity,
      stock_status: 'instock',
      backorders: 'no',
      sold_individually: false,
      weight: source.variants?.[0]?.weight.toString(),
      reviews_allowed: true,
    };

    if (source.images_urls) {
      res.images = source.images_urls.map((url) => ({ src: url })) as any;
    }

    if (source.tags) {
      res.tags = source.tags.map((tag) => ({ name: tag })) as any;
    }

    // Handle custom field mappings
    if (customFieldMappings) {
      res.meta_data = customFieldMappings.map((mapping) => ({
        key: mapping.slug,
        value: source.field_mappings?.[mapping.remote_id] || '',
      })) as any;
    }

    return res;
  }

  async unify(
    source: WoocommerceProductOutput | WoocommerceProductOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceProductOutput | UnifiedEcommerceProductOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleProductToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
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

  private mapSingleProductToUnified(
    product: WoocommerceProductOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEcommerceProductOutput {
    const unified: UnifiedEcommerceProductOutput = {
      remote_id: product.id.toString(),
      remote_data: product,
      product_url: product.permalink,
      product_type: product.type,
      product_status: product.status.toUpperCase(),
      images_urls: product.images?.map((image) => image.src) || [],
      description: product.description,
      vendor: '', // WooCommerce doesn't have a direct vendor field
      variants: [
        {
          title: product.name,
          price: parseFloat(product.price),
          sku: product.sku,
          options: null,
          weight: parseFloat(product.weight),
          inventory_quantity: product.stock_quantity || 0,
        },
      ],
      tags: product.tags?.map((tag) => tag.name) || [],
      field_mappings: {},
      created_at: product.date_created,
      modified_at: product.date_modified,
    };

    // Handle custom field mappings
    if (customFieldMappings && product.meta_data) {
      unified.field_mappings = product.meta_data.reduce((acc, meta) => {
        const mapping = customFieldMappings.find((m) => m.slug === meta.key);
        if (mapping) {
          acc[mapping.remote_id] = meta.value;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    return unified;
  }
}
