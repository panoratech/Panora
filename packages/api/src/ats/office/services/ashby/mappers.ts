import { AshbyOfficeInput, AshbyOfficeOutput } from './types';
import {
  UnifiedOfficeInput,
  UnifiedOfficeOutput,
} from '@ats/office/types/model.unified';
import { IOfficeMapper } from '@ats/office/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyOfficeMapper implements IOfficeMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'office', 'ashby', this);
  }

  async desunify(
    source: UnifiedOfficeInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyOfficeInput> {
    return;
  }

  async unify(
    source: AshbyOfficeOutput | AshbyOfficeOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfficeOutput | UnifiedOfficeOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleOfficeToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyOfficeOutput
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
    office: AshbyOfficeOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOfficeOutput> {
    return {
      remote_id: office.id,
      remote_data: office,
      name: office.name || null,
      location: `${office.address.postalAddress.addressLocality}, ${office.address.postalAddress.addressRegion}, ${office.address.postalAddress.addressCountry}`,
    };
  }
}
