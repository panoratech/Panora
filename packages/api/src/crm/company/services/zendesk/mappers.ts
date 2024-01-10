import { ZendeskCompanyInput, ZendeskCompanyOutput } from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';

export class ZendeskCompanyMapper implements ICompanyMapper {
  desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskCompanyInput {
    const result: ZendeskCompanyInput = {
      name: source.name,
      phone: source.phone_numbers?.find(
        (phone) => phone.phone_type === 'primary',
      )?.phone_number,
      created_at: new Date().toISOString(), // Placeholder, adjust as needed
      updated_at: new Date().toISOString(), // Placeholder, adjust as needed
      // Add other direct mappings and custom field mappings here
    };

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

    return source.map((company) =>
      this.mapSingleCompanyToUnified(company, customFieldMappings),
    );
  }

  private mapSingleCompanyToUnified(
    company: ZendeskCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: company[mapping.remote_id],
      })) || [];

    return {
      name: company.name,
      industry: '',
      number_of_employees: 0, //TODO
      field_mappings,
    };
  }
}
