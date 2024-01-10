import { HubspotCompanyInput, HubspotCompanyOutput } from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';

export class HubspotCompanyMapper implements ICompanyMapper {
  desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotCompanyInput {
    const result: HubspotCompanyInput = {
      city: '',
      name: source.name,
      phone: '',
      state: '',
      domain: '',
      industry: source.industry,
    };

    // Assuming 'phone_numbers' array contains at least one phone number
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;
    if (primaryPhone) {
      result.phone = primaryPhone;
    }
    const address = source.addresses[0];

    if (address) {
      result.city = address.city;
      result.state = address.state;
    }

    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }

    return result;
  }

  async unify(
    source: HubspotCompanyOutput | HubspotCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotCompanyOutput
    return source.map((company) =>
      this.mapSingleCompanyToUnified(company, customFieldMappings),
    );
  }

  private mapSingleCompanyToUnified(
    company: HubspotCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: company.properties[mapping.remote_id],
      })) || [];

    return {
      name: company.properties.name,
      industry: company.properties.industry,
      number_of_employees: 0, // Placeholder, as there's no direct mapping provided
      email_addresses: [
        {
          email_address: company.properties.email,
          email_address_type: 'primary',
          owner_type: 'company',
        },
      ], // Assuming 'email' is a property in company.properties
      addresses: [
        {
          street_1: company.properties.street,
          city: company.properties.city,
          state: company.properties.state,
          postal_code: company.properties.postal_code,
          country: company.properties.country,
          address_type: 'primary',
          owner_type: 'company',
        },
      ], // Assuming 'street', 'city', 'state', 'postal_code', 'country' are properties in company.properties
      phone_numbers: [
        {
          phone_number: company.properties.phone,
          phone_type: 'primary',
          owner_type: 'company',
        },
      ],
      field_mappings,
    };
  }
}
