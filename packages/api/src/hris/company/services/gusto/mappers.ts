import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoCompanyOutput } from './types';
import {
  UnifiedHrisCompanyInput,
  UnifiedHrisCompanyOutput,
} from '@hris/company/types/model.unified';
import { ICompanyMapper } from '@hris/company/types';
import { Utils } from '@hris/@lib/@utils';
import { UnifiedHrisLocationOutput } from '@hris/location/types/model.unified';
import { GustoLocationOutput } from '@hris/location/services/gusto/types';
import { HrisObject } from '@hris/@lib/@types';

@Injectable()
export class GustoCompanyMapper implements ICompanyMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'company', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisCompanyInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoCompanyOutput | GustoCompanyOutput[],
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
    company: GustoCompanyOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisCompanyOutput> {
    const opts: any = {};
    /*if (company.locations && company.locations.length > 0) {
      const locations = await this.ingestService.ingestData<
        UnifiedHrisLocationOutput,
        GustoLocationOutput
      >(
        company.locations,
        'gusto',
        connectionId,
        'hris',
        HrisObject.location,
        [],
      );
      if (locations) {
        opts.locations = locations;
      }
    }*/
    return {
      remote_id: company.uuid || null,
      legal_name: company.name || null,
      display_name: company.trade_name || null,
      eins: company.ein ? [company.ein] : [],
      remote_data: company,
      ...opts,
    };
  }
}
