import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { PipedriveCompanyInput, PipedriveCompanyOutput } from './types';
import { Utils } from '@crm/@lib/@utils';

export class PipedriveCompanyMapper implements ICompanyMapper {
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
  ): Promise<PipedriveCompanyInput> {
    const result: PipedriveCompanyInput = {
      name: source.name,
    };

    if (source.addresses && source.addresses[0]) {
      result.address = source.addresses[0].street_1;
      result.address_locality = source.addresses[0].city;
      result.address_country = source.addresses[0].country;
      result.address_postal_code = source.addresses[0].postal_code;
    }

    if (source.user_id) {
      const owner = await this.utils.getUser(source.user_id);
      if (owner) {
        result.owner_id = {
          id: Number(owner.remote_id),
          name: owner.name,
          email: owner.email,
          has_pic: 0,
          pic_hash: '',
          active_flag: false,
          value: 0,
        };
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
    source: PipedriveCompanyOutput | PipedriveCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCompanyOutput | UnifiedCompanyOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCompanyToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((company) =>
        this.mapSingleCompanyToUnified(company, customFieldMappings),
      ),
    );
  }

  private async mapSingleCompanyToUnified(
    company: PipedriveCompanyOutput,
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

    let res = {
      name: company.name,
      industry: '', // Pipedrive may not directly provide this, need custom mapping
      number_of_employees: 0, // Placeholder, as there's no direct mapping provided
      email_addresses: [],
      phone_numbers: [],
      addresses: [],
      field_mappings,
    };

    let opts: any = {};
    if (company.owner_id.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(company.owner_id.id),
        'pipedrive',
      );
      if (user_id) {
        opts = {
          user_id: user_id,
        };
      }
    }
    if (company.address) {
      res.addresses[0] = {
        street_1: company.address,
        city: company.address_locality,
        country: company.address_country,
        postal_code: company.address_postal_code,
      };
    }
    return {
      remote_id: company.id,
      ...res,
      ...opts,
    };
  }
}
