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
    const opts: any = {};

    /*if (location.employee_uuid) {
      const employee_id = await this.utils.getEmployeeUuidFromRemoteId(
        location.employee_uuid,
        connectionId,
      );
      if (employee_id) {
        opts.employee_id = employee_id;
      }
    }
    if (location.company_location_uuid) {
      const id = await this.utils.getEmployerLocationUuidFromRemoteId(
        location.company_location_uuid,
        connectionId,
      );
      if (id) {
        opts.employer_location_id = id;
      }
    }

    return {
      remote_id: location.uuid || null,
      remote_data: location,
      ...opts,
      employee_contribution: location.employee_deduction
        ? parseFloat(location.employee_deduction)
        : null,
      company_contribution: location.company_contribution
        ? parseFloat(location.company_contribution)
        : null,
      remote_was_deleted: null,
    };*/
    return;
  }
}
