import {
  ShopifyFulfillmentOrdersInput,
  ShopifyFulfillmentOrdersOutput,
} from './types';
import {
  UnifiedEcommerceFulfillmentOrdersInput,
  UnifiedEcommerceFulfillmentOrdersOutput,
} from '@ecommerce/fulfillmentorders/types/model.unified';
import { IFulfillmentOrdersMapper } from '@ecommerce/fulfillmentorders/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class ShopifyFulfillmentOrdersMapper
  implements IFulfillmentOrdersMapper
{
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'fulfillmentorders',
      'shopify',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceFulfillmentOrdersInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyFulfillmentOrdersInput> {
    return;
  }

  async unify(
    source: ShopifyFulfillmentOrdersOutput | ShopifyFulfillmentOrdersOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedEcommerceFulfillmentOrdersOutput | UnifiedEcommerceFulfillmentOrdersOutput[]
  > {
    if (!Array.isArray(source)) {
      return await this.mapSingleFulfillmentOrdersToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ShopifyFulfillmentOrdersOutput
    return Promise.all(
      source.map((fulfillmentorders) =>
        this.mapSingleFulfillmentOrdersToUnified(
          fulfillmentorders,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleFulfillmentOrdersToUnified(
    fulfillmentorders: ShopifyFulfillmentOrdersOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceFulfillmentOrdersOutput> {
    return {
      remote_id: fulfillmentorders.id,
      remote_data: fulfillmentorders,
      name: fulfillmentorders.name || null,
    };
  }
}
