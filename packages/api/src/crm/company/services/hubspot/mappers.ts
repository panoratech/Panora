import { HubspotCompanyInput, HubspotCompanyOutput } from './types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Injectable()
export class HubspotCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'hubspot', this);
  }
  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotCompanyInput> {
    const result: any = {
      name: source.name,
      industry: source.industry || null,
    };

    if (source.number_of_employees) {
      result.numberofemployees = source.number_of_employees;
    }

    // Assuming 'phone_numbers' array contains at least one phone number
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;
    if (primaryPhone) {
      result.phone = primaryPhone;
    }
    if (source.addresses) {
      const address = source.addresses[0];
      if (address) {
        result.city = address.city;
        result.state = address.state;
        result.zip = address.postal_code;
        result.address = address.street_1;
        result.country = address.country;
      }
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

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
    source: HubspotCompanyOutput | HubspotCompanyOutput[],
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
    // Handling array of HubspotCompanyOutput
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
    company: HubspotCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company.properties[mapping.remote_id];
      }
    }
    let opts: any = {};
    if (company.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        company.properties.hubspot_owner_id,
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
      name: company.properties.name,
      industry: company.properties.industry,
      number_of_employees: company.properties.numberofemployees,
      addresses: [
        {
          street_1: company.properties.address,
          city: company.properties.city,
          state: company.properties.state,
          postal_code: company.properties.zip,
          country: company.properties.country,
          address_type: 'WORK',
          owner_type: 'COMPANY',
        },
      ],
      phone_numbers: [
        {
          phone_number: company.properties.phone,
          phone_type: 'WORK',
          owner_type: 'COMPANY',
        },
      ],
      field_mappings,
      ...opts,
    };
  }
}
