import { SalesforceCompanyInput, SalesforceCompanyOutput } from './types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Injectable()
export class SalesforceCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'salesforce', this);
  }

  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SalesforceCompanyInput> {
    const result: any = {
      Name: source.name,
      Industry: source.industry || null,
    };

    if (source.number_of_employees) {
      result.NumberOfEmployees = source.number_of_employees;
    }

    if (source.phone_numbers && source.phone_numbers.length > 0) {
      result.Phone = source.phone_numbers[0].phone_number;
    }

    if (source.addresses && source.addresses.length > 0) {
      const address = source.addresses[0];
      result.BillingCity = address.city;
      result.BillingState = address.state;
      result.BillingPostalCode = address.postal_code;
      result.BillingStreet = address.street_1;
      result.BillingCountry = address.country;
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
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
    source: SalesforceCompanyOutput | SalesforceCompanyOutput[],
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
    company: SalesforceCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (company.OwnerId) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        company.OwnerId,
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      remote_id: company.Id,
      remote_data: company,
      name: company.Name,
      industry: company.Industry,
      number_of_employees: company.NumberOfEmployees,
      addresses: [
        {
          street_1: company.BillingStreet,
          city: company.BillingCity,
          state: company.BillingState,
          postal_code: company.BillingPostalCode,
          country: company.BillingCountry,
          address_type: 'BILLING',
          owner_type: 'COMPANY',
        },
      ],
      phone_numbers: [
        {
          phone_number: company.Phone,
          phone_type: 'WORK',
          owner_type: 'COMPANY',
        },
      ],
      field_mappings,
      ...opts,
    };
  }
}