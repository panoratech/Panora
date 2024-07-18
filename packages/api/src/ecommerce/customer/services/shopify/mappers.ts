import { ShopifyCustomerInput, ShopifyCustomerOutput } from './types';
import {
  UnifiedCustomerInput,
  UnifiedCustomerOutput,
} from '@ecommerce/customer/types/model.unified';
import { ICustomerMapper } from '@ecommerce/customer/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ecommerce/@lib/@utils';

@Injectable()
export class ShopifyCustomerMapper implements ICustomerMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'customer',
      'ashby',
      this,
    );
  }

  async desunify(
    source: UnifiedCustomerInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ShopifyCustomerInput> {
    return;
  }

  async unify(
    source: ShopifyCustomerOutput | ShopifyCustomerOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCustomerOutput | UnifiedCustomerOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCustomerToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ShopifyCustomerOutput
    return Promise.all(
      source.map((customer) =>
        this.mapSingleCustomerToUnified(
          customer,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleCustomerToUnified(
    customer: ShopifyCustomerOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCustomerOutput> {
    return {
      remote_id: customer.id,
      remote_data: customer,
      name: customer.name || null,
    };
  }
}
