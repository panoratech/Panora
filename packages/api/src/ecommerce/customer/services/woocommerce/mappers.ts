import { WoocommerceCustomerInput, WoocommerceCustomerOutput } from './types';
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
export class WoocommerceCustomerMapper implements ICustomerMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'customer',
      'woocommerce',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceCustomerInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WoocommerceCustomerInput> {
    return;
  }

  async unify(
    source: WoocommerceCustomerOutput | WoocommerceCustomerOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedEcommerceCustomerOutput | UnifiedEcommerceCustomerOutput[]
  > {
    if (!Array.isArray(source)) {
      return this.mapSingleCustomerToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
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

  private mapSingleCustomerToUnified(
    customer: WoocommerceCustomerOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEcommerceCustomerOutput {
    const result: UnifiedEcommerceCustomerOutput = {
      remote_id: customer.id?.toString(),
      remote_data: customer,
      email: customer.email,
      first_name: customer.first_name || null,
      last_name: customer.last_name || null,
      phone_number: customer.billing?.phone || null,
      addresses: [],
      field_mappings: {},
    };

    if (customer.billing) {
      if (
        customer.billing.address_1 &&
        customer.billing.city &&
        customer.billing.state &&
        customer.billing.postcode &&
        customer.billing.country
      ) {
        result.addresses.push({
          address_type: 'BILLING',
          street_1: customer.billing.address_1,
          street_2: customer.billing.address_2,
          city: customer.billing.city,
          state: customer.billing.state,
          postal_code: customer.billing.postcode,
          country: customer.billing.country,
        });
      }
    }

    if (customer.shipping) {
      if (
        customer.billing.address_1 &&
        customer.billing.city &&
        customer.billing.state &&
        customer.billing.postcode &&
        customer.billing.country
      ) {
        result.addresses.push({
          address_type: 'SHIPPING',
          street_1: customer.billing.address_1,
          street_2: customer.billing.address_2,
          city: customer.billing.city,
          state: customer.billing.state,
          postal_code: customer.billing.postcode,
          country: customer.billing.country,
        });
      }
    }

    if (customFieldMappings && customer.meta_data) {
      result.field_mappings = customer.meta_data.reduce((acc, meta) => {
        const mapping = customFieldMappings.find((m) => m.slug === meta.key);
        if (mapping) {
          acc[mapping.remote_id] = meta.value;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    return result;
  }
}
