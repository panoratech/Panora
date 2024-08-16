import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { DeelLocationOutput } from './types';
import {
  UnifiedHrisLocationInput,
  UnifiedHrisLocationOutput,
} from '@hris/location/types/model.unified';
import { ILocationMapper } from '@hris/location/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class DeelLocationMapper implements ILocationMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'location', 'deel', this);
  }

  async desunify(
    source: UnifiedHrisLocationInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: DeelLocationOutput | DeelLocationOutput[],
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisLocationOutput | UnifiedHrisLocationOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleLocationToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((location) =>
        this.mapSingleLocationToUnified(
          location,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleLocationToUnified(
    location: DeelLocationOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisLocationOutput> {
    return {
      remote_id: null,
      remote_data: location,
      street_1: location.streetAddress,
      city: location.locality,
      state: location.region,
      zip_code: location.postalCode,
      country: location.country,
      location_type: location.type,
    };
  }
}
