import { SquarespaceCustomerInput, SquarespaceCustomerOutput } from './types';
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
export class SquarespaceCustomerMapper implements ICustomerMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ecommerce',
      'customer',
      'squarespace',
      this,
    );
  }

  async desunify(
    source: UnifiedEcommerceCustomerInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SquarespaceCustomerInput> {
    return;
  }

  async unify(
    source: SquarespaceCustomerOutput | SquarespaceCustomerOutput[],
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
    // Handling array of SquarespaceCustomerOutput
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
    customer: SquarespaceCustomerOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEcommerceCustomerOutput> {
    const result: UnifiedEcommerceCustomerOutput = {
      remote_id: customer.id?.toString(),
      remote_data: customer,
      email: customer.email || null,
      first_name: customer.firstName || null,
      last_name: customer.lastName || null,
      phone_number: null,
      addresses: [],
      field_mappings:
        customFieldMappings?.reduce((acc, mapping) => {
          acc[mapping.slug] = customer[mapping.remote_id];
          return acc;
        }, {} as Record<string, any>) || {},
    };

    return result;
  }
}
