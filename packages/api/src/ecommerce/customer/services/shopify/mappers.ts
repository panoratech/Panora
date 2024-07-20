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
      remote_id: customer.id?.toString(),
      remote_data: customer,
      email: customer.email || null,
      first_name: customer.first_name || null,
      last_name: customer.last_name || null,
      phone_number: customer.phone || null,
      addresses:
        customer.addresses?.map((address) => ({
          street_1: address.address1,
          street_2: address.address2 || undefined,
          city: address.city,
          state: address.province,
          postal_code: address.zip,
          country: address.country,
          address_type: address.default ? 'PERSONAL' : 'WORK',
        })) || [],
      field_mappings:
        customFieldMappings?.reduce((acc, mapping) => {
          acc[mapping.slug] = customer[mapping.remote_id];
          return acc;
        }, {} as Record<string, any>) || {},
    };
  }
}
