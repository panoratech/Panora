import {
  UnifiedEcommerceProductInput,
  UnifiedEcommerceProductOutput,
} from '@ecommerce/product/types/model.unified';
import { IProductMapper } from '@ecommerce/product/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { WebflowProductInput, WebflowProductOutput } from './types';

@Injectable()
export class WebflowProductMapper implements IProductMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'product',
      'webflow',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceProductInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<Partial<WebflowProductInput>> {
    const res: Partial<WebflowProductInput> = {
      product: {
        fieldData: {
          name: source.variants?.[0]?.title,
          slug: source.product_url?.split('/').pop() || '',
          description: source.description,
          shippable: true,
        },
      },
      sku: {
        fieldData: {
          name: source.variants?.[0]?.title,
          slug: source.variants?.[0]?.sku,
          sku: source.variants?.[0]?.sku,
          price: {
            value: parseInt(source.variants?.[0]?.price.toString(), 10),
            unit: 'USD',
          },
        },
      },
    };

    customFieldMappings?.forEach((mapping) => {
      if (mapping.slug === 'publishStatus') {
        res.publishStatus = source[mapping.remote_id];
        return;
      }

      res.product.fieldData[mapping.slug] = source[mapping.remote_id];
    });

    return res;
  }

  async unify(
    source: WebflowProductOutput | WebflowProductOutput[],
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
    // Handling array of WebflowProductOutput
    return Promise.all(
      source.map((data) =>
        this.mapSingleProductToUnified(data, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleProductToUnified(
    data: WebflowProductOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceProductOutput> {
    return {
      remote_id: data.product.id,
      remote_data: data,
      images_urls: (data.skus || [])
        .map(({ fieldData: { mainImage } }) => mainImage?.url)
        .filter(Boolean),
      description: data.product.fieldData?.description,
      tags: data.product.fieldData?.categories,
      created_at: data.product?.createdOn,
      modified_at: data.product?.lastUpdated,
      variants: data.skus?.map((sku) => ({
        title: sku?.fieldData?.name,
        price: sku?.fieldData?.price?.value,
        sku: sku?.fieldData?.sku,
        inventory_quantity: sku?.fieldData?.quantity,
        weight: sku?.fieldData?.weight,
        options: null,
      })),
    };
  }
}
