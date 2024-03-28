import {
  Address,
  ZendeskCompanyInput,
  ZendeskCompanyOutput,
} from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/contact/utils';


//TODO - Zendesk does not have Company object

export class ZendeskCompanyMapper implements ICompanyMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }
  async desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskCompanyInput> {
    // Assuming 'email_addresses' array contains at least one email and 'phone_numbers' array contains at least one phone number
    const primaryEmail = source.email_addresses?.[0]?.email_address;
    const primaryPhone = source.phone_numbers?.[0]?.phone_number;

    const result: ZendeskCompanyInput = {
      name: source.name,
      email: primaryEmail,
      phone: primaryPhone,
      address: {
        line1: source.addresses[0].street_1,
        city: source.addresses[0].city,
        state: source.addresses[0].state,
        postal_code: source.addresses[0].postal_code,
        country: source.addresses[0].country,
      },
      is_organization: true,
      industry: source.industry,
    };
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.owner_id = Number(owner_id);
      }
    }
    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result.custom_fields[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }
    return result;
  }

  async unify(
    source: ZendeskCompanyOutput | ZendeskCompanyOutput[],
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
    company: ZendeskCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput> {
    const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: company.custom_fields[mapping.remote_id],
    }));
    // Constructing the email and phone details
    const email_addresses = company.email
      ? [{ email_address: company.email, email_address_type: 'primary' }]
      : [];
    const phone_numbers = [];

    if (company.phone) {
      phone_numbers.push({ phone_number: company.phone, phone_type: 'work' });
    }
    if (company.mobile) {
      phone_numbers.push({
        phone_number: company.mobile,
        phone_type: 'mobile',
      });
    }

    let opts: any = {};
    if (company.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(company.owner_id),
        'zendesk',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }

    const address: Address = {
      street_1: company.address.line1,
      city: company.address.city,
      state: company.address.state,
      postal_code: company.address.postal_code,
      country: company.address.country,
    };

    if (company.industry) {
      opts = {
        industry: company.industry,
      };
    }

    return {
      remote_id: company.id,
      name: company.name,
      email_addresses,
      phone_numbers,
      field_mappings,
      addresses: [address],
      ...opts,
    };
  }
}
