import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { Injectable } from '@nestjs/common';
import { GustoLocationOutput } from './types';
import {
  UnifiedHrisLocationInput,
  UnifiedHrisLocationOutput,
} from '@hris/location/types/model.unified';
import { ILocationMapper } from '@hris/location/types';
import { Utils } from '@hris/@lib/@utils';

@Injectable()
export class GustoLocationMapper implements ILocationMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('hris', 'location', 'gusto', this);
  }

  async desunify(
    source: UnifiedHrisLocationInput,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: GustoLocationOutput | GustoLocationOutput[],
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
    location: GustoLocationOutput,
    connectionId: string,
    customFieldMappings?: { slug: string; remote_id: string }[],
  ): Promise<UnifiedHrisLocationOutput> {
    return {
      remote_id: location.uuid || null,
      remote_data: location,
      street_1: location.street_1,
      street_2: location.street_2,
      city: location.city,
      state: location.state,
      zip_code: location.zip,
      country: location.country,
      location_type: location.type,
    };
  }
}
