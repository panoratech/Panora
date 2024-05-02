import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { ZohoCompanyInput, ZohoCompanyOutput } from './types';
import { Utils } from '@crm/@lib/@utils';

export class ZohoCompanyMapper implements ICompanyMapper {
  private utils = new Utils();

  async desunify(
    source: UnifiedCompanyInput,
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
        (phone) => phone.phone_type === 'primary',
      )?.phone_number;
    }

    if (source.user_id) {
      result.Owner.id = await this.utils.getRemoteIdFromUserUuid(
        source.user_id,
      );
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(company, customFieldMappings),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: ZohoCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company[mapping.remote_id];
      }
    }

    return {
      name: company.Account_Name,
      phone_numbers: [
        {
          phone_number: company.Phone,
          phone_type: 'primary',
          owner_type: 'company',
        },
      ],
      addresses: [
        {
          street_1: company.Billing_Street,
          city: company.Billing_City,
          state: company.Billing_State,
          postal_code: company.Billing_Code,
          country: company.Billing_Country,
          address_type: 'primary',
          owner_type: 'company',
        },
      ],
      industry: company.Industry, //TODO: map to correct industry
      user_id: await this.utils.getUserUuidFromRemoteId(
        company.Owner.id,
        'zoho',
      ),
      number_of_employees: company.Employees,
      field_mappings,
    };
  }
}
