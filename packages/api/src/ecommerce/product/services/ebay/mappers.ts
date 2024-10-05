import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '@ecommerce/product/types/model.unified';
import { IProductMapper } from '@ecommerce/product/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { EbayProductInput, EbayProductOutput } from './types';

@Injectable()
export class EbayProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'product', 'ebay', this);
  }

  async desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<Partial<EbayProductInput>> {
    const res: Partial<EbayProductInput> = {
      sku: source.variants?.[0]?.sku,
      product: {
        description: source.description,
        title: source.variants?.[0]?.title,
        imageUrls: source.images_urls,
      },
    };
    return res;
  }

  async unify(
    source: EbayProductOutput | EbayProductOutput[],
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
    source: EbayProductOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEcommerceProductOutput {
    const res: UnifiedEcommerceProductOutput = {
      remote_id: source.product.epid,
      remote_data: source,
      images_urls: source.product.imageUrls,
      description: source.product.description,
      variants: [
        {
          title: source.product.title,
          sku: source.sku,
          price: null,
          options: source.product.aspects?.Brand,
          weight: null,
          inventory_quantity: null,
        },
      ],
      field_mappings: {},
    };

    if (customFieldMappings?.length) {
      for (const mapping of customFieldMappings) {
        res.field_mappings[mapping.slug] =
          source.product.aspects?.[mapping.remote_id];
      }
    }
    return res;
  }
}
