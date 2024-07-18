import { ShopifyFulfillmentInput, ShopifyFulfillmentOutput } from './types';
import {
  UnifiedFulfillmentInput,
  UnifiedFulfillmentOutput,
} from '@ecommerce/fulfillment/types/model.unified';
import { IFulfillmentMapper } from '@ecommerce/fulfillment/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class ShopifyFulfillmentMapper implements IFulfillmentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'fulfillment',
      'shopify',
      this,
    );
  }

  async desunify(
    source: UnifiedFulfillmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyFulfillmentInput> {
    return;
  }

  async unify(
    source: ShopifyFulfillmentOutput | ShopifyFulfillmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFulfillmentOutput | UnifiedFulfillmentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleFulfillmentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ShopifyFulfillmentOutput
    return Promise.all(
      source.map((fulfillment) =>
        this.mapSingleFulfillmentToUnified(
          fulfillment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleFulfillmentToUnified(
    fulfillment: ShopifyFulfillmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFulfillmentOutput> {
    return {
      remote_id: fulfillment.id,
      remote_data: fulfillment,
      name: fulfillment.name || null,
    };
  }
}
