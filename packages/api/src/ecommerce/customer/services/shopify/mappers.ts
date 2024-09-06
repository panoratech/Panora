import { ShopifyCustomerInput, ShopifyCustomerOutput } from './types';
import {
  UnifiedEcommerceCustomerInput,
  UnifiedEcommerceCustomerOutput,
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
      'shopify',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceCustomerInput,
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
  ): Promise<
    UnifiedEcommerceCustomerOutput | UnifiedEcommerceCustomerOutput[]
  > {
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
  ): Promise<UnifiedEcommerceCustomerOutput> {
    const result = {
      remote_id: customer.id?.toString(),
      remote_data: customer,
      email: customer.email || null,
      first_name: customer.first_name || null,
      last_name: customer.last_name || null,
      phone_number: customer.phone || null,
      addresses: [],
      field_mappings:
        customFieldMappings?.reduce((acc, mapping) => {
          acc[mapping.slug] = customer[mapping.remote_id];
          return acc;
        }, {} as Record<string, any>) || {},
    };

    if (customer.addresses) {
      for (const add of customer.addresses) {
        if (add.address1 && add.city && add.country) {
          result.addresses.push({
            street_1: add.address1,
            street_2: add.address2 || undefined,
            city: add.city,
            state: add.province,
            postal_code: add.zip,
            country: add.country,
            address_type: add.default ? 'SHIPPING' : null,
          });
        }
      }
    }

    return result;
  }
}
