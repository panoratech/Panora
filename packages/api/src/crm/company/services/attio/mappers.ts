import { AttioCompanyInput, AttioCompanyOutput } from './types';
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
export class AttioCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'attio', this);
  }
  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AttioCompanyInput> {
    const result: AttioCompanyInput = {
      values: {
        name: [
          {
            value: source.name,
          },
        ],
      },
    };
    /*todo if (source.industry) {
      result.values.categories = [
        {
          option: source.industry,
        },
      ];
    }*/

    if (source.addresses) {
      const address = source.addresses[0];
      if (address) {
        result.values.primary_location = [
          {
            locality: address.city,
            line_1: address.street_1,
            line_2: address.street_2 ?? null,
            line_3: null,
            line_4: null,
            region: address.state,
            postcode: address.postal_code,
            latitude: null,
            longitude: null,
            country_code: getCountryCode(address.country),
          },
        ];
      }
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.values.team = [
          {
            target_object: 'people',
            target_record_id: owner_id,
          },
        ];
      }
    }

    // Attio company does not have attribute for email address
    // Attio Company doest not have direct mapping of number of employees

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
    source: AttioCompanyOutput | AttioCompanyOutput[],
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
    // Handling array of AttioCompanyOutput
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
    company: AttioCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company.values[mapping.remote_id];
      }
    }

    let opts: any = {};

    if (company.values.team[0]?.target_record_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        company.values.team[0].target_record_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      remote_id: company.id.record_id,
      remote_data: company,
      name: company.values.name[0]?.value,
      industry:
        typeof company.values.categories[0]?.option === 'string'
          ? company.values.categories[0]?.option
          : company.values.categories[0]?.option.title,
      number_of_employees: null,
      addresses: [
        {
          street_1: company.values.primary_location[0]?.line_1,
          city: company.values.primary_location[0]?.locality,
          state: company.values.primary_location[0]?.region,
          postal_code: company.values.primary_location[0]?.postcode,
          country: getCountryName(
            company.values.primary_location[0]?.country_code,
          ),
          address_type: 'WORK',
          owner_type: 'COMPANY',
        },
      ],
      field_mappings,
      ...opts,
    };
  }
}
