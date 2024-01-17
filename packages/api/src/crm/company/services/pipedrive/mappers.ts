import {
  PipedriveCompanyInput,
  PipedriveCompanyOutput,
} from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';
import { Utils } from '@crm/contact/utils';

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
      email: source.email_addresses?.find(
        (email) => email.email_address_type === 'primary',
      )?.email_address
        ? [
            {
              value: source.email_addresses.find(
                (email) => email.email_address_type === 'primary',
              )?.email_address,
              primary: true,
              label: 'Primary Email',
            },
          ]
        : undefined,
      phone: source.phone_numbers?.find(
        (phone) => phone.phone_type === 'primary',
      )?.phone_number
        ? [
            {
              value: source.phone_numbers.find(
                (phone) => phone.phone_type === 'primary',
              )?.phone_number,
              primary: true,
              label: 'Primary Phone',
            },
          ]
        : undefined,
      // Add additional fields mapping here
    };

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
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
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
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: company[mapping.remote_id],
      })) || [];

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

    return {
      name: company.name,
      industry: '', // Pipedrive may not directly provide this, need custom mapping
      number_of_employees: 0, // Placeholder, as there's no direct mapping provided
      email_addresses: [
        {
          email_address: company.primary_email,
          email_address_type: 'primary',
          owner_type: 'company',
        },
      ],
      addresses: [], // Add address mapping if available
      phone_numbers: company.phone?.map((phone) => ({
        phone_number: phone.value,
        phone_type: phone.primary ? 'primary' : 'secondary',
        owner_type: 'company',
      })),
      field_mappings,
      ...opts,
    };
  }
}
