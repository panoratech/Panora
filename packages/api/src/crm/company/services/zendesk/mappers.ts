import { Address } from '@crm/@lib/@types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { ZendeskCompanyInput, ZendeskCompanyOutput } from './types';
import { Utils } from '@crm/@lib/@utils';
import { Injectable } from '@nestjs/common';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';

@Injectable()
export class ZendeskCompanyMapper implements ICompanyMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'company', 'zendesk', this);
  }

  async desunify(
    source: UnifiedCrmCompanyInput,
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
      is_organization: true,
      industry: source.industry,
    };

    if (source.addresses && source.addresses[0]) {
      result.address = {
        line1: source.addresses[0].street_1,
        city: source.addresses[0].city,
        state: source.addresses[0].state,
        postal_code: source.addresses[0].postal_code,
        country: source.addresses[0].country,
      };
    }

    if (primaryEmail) {
      result.email = primaryEmail;
    }
    if (primaryPhone) {
      result.phone = primaryPhone;
    }
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.owner_id = Number(owner_id);
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
    source: ZendeskCompanyOutput | ZendeskCompanyOutput[],
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
    company: ZendeskCompanyOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmCompanyOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = company.custom_fields[mapping.remote_id];
      }
    }

    // Constructing the email and phone details
    const email_addresses = company.email
      ? [{ email_address: company.email, email_address_type: 'WORK' }]
      : null;
    const phone_numbers = [];

    if (company.phone) {
      phone_numbers.push({ phone_number: company.phone, phone_type: 'WORK' });
    }
    if (company.mobile) {
      phone_numbers.push({
        phone_number: company.mobile,
        phone_type: 'MOBILE',
      });
    }

    let opts: any = {};
    if (company.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(company.owner_id),
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
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
        ...opts,
        industry: company.industry,
      };
    }

    return {
      remote_id: String(company.id),
      remote_data: company,
      name: company.name,
      email_addresses,
      phone_numbers,
      field_mappings,
      addresses: [address],
      ...opts,
    };
  }
}
