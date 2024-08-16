import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { DeelCompanyOutput } from './types';
import {
  UnifiedHrisCompanyInput,
  UnifiedHrisCompanyOutput,
} from '@hris/company/types/model.unified';
import { ICompanyMapper } from '@hris/company/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class DeelCompanyMapper implements ICompanyMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'company', 'deel', this);
  }

  async desunify(
    source: UnifiedHrisCompanyInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    // Implementation for desunify (if needed)
    return;
  }

  async unify(
    source: DeelCompanyOutput | DeelCompanyOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisCompanyOutput | UnifiedHrisCompanyOutput[]> {
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
    company: DeelCompanyOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisCompanyOutput> {
    return {
      remote_id: company.id || null,
      legal_name: company.name || null,
      display_name: company.name || null, // Using name for display_name as well
      eins: [], // Deel doesn't provide EINs in this data structure
      remote_data: company,
      locations: [], // Deel doesn't provide locations in this data structure
      field_mappings: {},
    };
  }
}
