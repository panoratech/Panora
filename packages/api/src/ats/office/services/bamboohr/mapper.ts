
import {
  UnifiedAtsOfficeInput,
  UnifiedAtsOfficeOutput,
} from '@ats/office/types/model.unified';
import { IOfficeMapper } from '@ats/office/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';
import { BamboohrOutput } from './types';

@Injectable()
export class BamboohrMapper implements IOfficeMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'office', 'bamboohr', this);
  }

  async desunify(
    source: UnifiedAtsOfficeInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<BamboohrOutput> {
    return;
  }

  async unify(
    source: BamboohrOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsOfficeOutput[]> {
    return Promise.all(
      source.map((office) =>
        this.mapSingleOfficeToUnified(
          office,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleOfficeToUnified(
    office: BamboohrOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsOfficeOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = office[mapping.remote_id];
      }
    }

    return {
      remote_id: office.id,
      remote_data: office,
      name: office.name || null,
      location: `${office.addressLine1}, ${office.addressLine2}, ${office.city}, ${office.state.name}, ${office.zipcode}, ${office.country}`,
      ...field_mappings,
    };
  }
}
