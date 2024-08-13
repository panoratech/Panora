import { AmazonCustomerOutput } from './types';
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
export class AmazonCustomerMapper implements ICustomerMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'customer',
      'amazon',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceCustomerInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: AmazonCustomerOutput | AmazonCustomerOutput[],
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
    // Handling array of AmazonCustomerOutput
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
    customer: AmazonCustomerOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceCustomerOutput> {
    const result: UnifiedEcommerceCustomerOutput = {
      remote_id: null,
      remote_data: customer,
      email: customer.BuyerEmail || null,
      first_name: customer.BuyerName || null,
      phone_number: null,
    };
    if (customer.Address) {
      const add = customer.Address;
      result.addresses = [
        {
          street_1: add.AddressLine1,
          street_2: null,
          city: add.City,
          state: add.StateOrRegion,
          postal_code: add.PostalCode,
          country: add.CountryCode,
          address_type: 'SHIPPING',
        },
      ];
    }

    return result;
  }
}
