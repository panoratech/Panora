import {
  PipedriveCompanyInput,
  PipedriveCompanyOutput,
} from '@crm/@utils/@types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import { ICompanyMapper } from '@crm/company/types';

export class PipedriveCompanyMapper implements ICompanyMapper {
  desunify(
    source: UnifiedCompanyInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveCompanyInput {
    return;
  }

  unify(
    source: PipedriveCompanyOutput | PipedriveCompanyOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyOutput | UnifiedCompanyOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleCompanyToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotCompanyOutput
    return source.map((company) =>
      this.mapSingleCompanyToUnified(company, customFieldMappings),
    );
  }

  private mapSingleCompanyToUnified(
    company: PipedriveCompanyOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCompanyOutput {
    return;
  }
}
