import {
  UnifiedOrderInput,
  UnifiedOrderOutput,
} from '@ecommerce/order/types/model.unified';
import { IOrderMapper } from '@ecommerce/order/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';
import { ShopifyOrderOutput } from './types';

@Injectable()
export class ShopifyOrderMapper implements IOrderMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ecommerce', 'order', 'shopify', this);
  }

  async desunify(
    source: UnifiedOrderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyOrderOutput> {
    return;
  }

  async unify(
    source: ShopifyOrderOutput | ShopifyOrderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOrderOutput | UnifiedOrderOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleOrderToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyOrderOutput
    return Promise.all(
      source.map((order) =>
        this.mapSingleOrderToUnified(order, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleOrderToUnified(
    order: ShopifyOrderOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOrderOutput> {
    return {
      remote_id: order.id,
      remote_data: order,
      name: order.name || null,
    };
  }
}
