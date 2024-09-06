import { CloseCompanyInput, CloseCompanyOutput } from './types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { getCountryCode, getCountryName } from '@@core/utils/types';

@Injectable()
export class CloseCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'close', this);
  }

  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseCompanyInput> {
    const result: CloseCompanyInput = {
      name: source?.name,
      addresses: source?.addresses?.map((address) => ({
        address_1: address.street_1,
        address_2: address.street_2,
        city: address.city,
        state: address.state,
        country: getCountryCode(address.country),
        zipcode: address.postal_code,
        label: address.address_type,
      })) as CloseCompanyInput['addresses'],
    };

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }
    return result;
  }

  async unify(
    source: CloseCompanyOutput | CloseCompanyOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput | UnifiedCrmCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of CloseCompanyOutput
    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(
          company,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: CloseCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company[`custom.${mapping.remote_id}`];
      }
    }
    let opts: any = {};
    if (company?.created_by || company?.custom?.close_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        (company?.created_by || company?.custom?.close_owner_id) as string,
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    return {
      remote_id: company.id,
      remote_data: company,
      name: company.name,
      number_of_employees: company?.custom?.employees || null,
      addresses: company?.addresses?.map((address) => ({
        street_1: address.address_1,
        street_2: address.address_2,
        city: address.city,
        state: address.state,
        postal_code: address.zipcode,
        country: getCountryName(address.country) || address.country,
        address_type: address.label,
        owner_type: 'COMPANY',
      })),
      field_mappings,
      ...opts,
    };
  }
}
