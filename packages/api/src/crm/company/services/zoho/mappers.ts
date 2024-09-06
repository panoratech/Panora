import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ZohoCompanyInput, ZohoCompanyOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { ICompanyMapper } from '@crm/company/types';
import { Industry } from '@crm/@lib/@types';

@Injectable()
export class ZohoCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'zoho', this);
  }
  async desunify(
    source: UnifiedCrmCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoCompanyInput> {
    const result: ZohoCompanyInput = {
      Account_Name: source.name,
    };
    if (source.number_of_employees) {
      result.Employees = source.number_of_employees;
    }

    if (source.addresses && source.addresses[0]) {
      result.Billing_Street = source.addresses?.[0]?.street_1;
      result.Billing_City = source.addresses?.[0]?.city;
      result.Billing_State = source.addresses?.[0]?.state;
      result.Billing_Code = source.addresses?.[0]?.postal_code;
      result.Billing_Country = source.addresses?.[0]?.country;
    }
    if (source.phone_numbers) {
      result.Phone = source.phone_numbers?.find(
        (phone) => phone.phone_type === 'WORK',
      )?.phone_number;
    }

    if (source.user_id) {
      result.Owner = {
        id: await this.utils.getRemoteIdFromUserUuid(source.user_id),
      };
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
    source: ZohoCompanyOutput | ZohoCompanyOutput[],
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
    company: ZohoCompanyOutput,
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
    const opts: any = {};
    if (company.Owner && company.Owner.id) {
      opts.user_id = await this.utils.getUserUuidFromRemoteId(
        company.Owner.id,
        connectionId,
      );
    }

    return {
      remote_id: company.id,
      remote_data: company,
      name: company.Account_Name,
      phone_numbers: [
        {
          phone_number: company.Phone,
          phone_type: 'WORK',
          owner_type: 'COMPANY',
        },
      ],
      addresses: [
        {
          street_1: company.Billing_Street,
          city: company.Billing_City,
          state: company.Billing_State,
          postal_code: company.Billing_Code,
          country: company.Billing_Country,
          address_type: 'PERSONAL',
          owner_type: 'COMPANY',
        },
      ],
      ...opts,
      industry: company.Industry,
      number_of_employees: company.Employees,
      field_mappings,
    };
  }
}
