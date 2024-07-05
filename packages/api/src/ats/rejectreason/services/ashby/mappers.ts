import { AshbyRejectReasonInput, AshbyRejectReasonOutput } from './types';
import {
  UnifiedRejectReasonInput,
  UnifiedRejectReasonOutput,
} from '@ats/rejectreason/types/model.unified';
import { IRejectReasonMapper } from '@ats/rejectreason/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { Utils } from '@ats/@lib/@utils';

@Injectable()
export class AshbyRejectReasonMapper implements IRejectReasonMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ats', 'rejectreason', 'ashby', this);
  }

  async desunify(
    source: UnifiedRejectReasonInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AshbyRejectReasonInput> {
    return;
  }

  async unify(
    source: AshbyRejectReasonOutput | AshbyRejectReasonOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedRejectReasonOutput | UnifiedRejectReasonOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleRejectReasonToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of AshbyRejectReasonOutput
    return Promise.all(
      source.map((rejectreason) =>
        this.mapSingleRejectReasonToUnified(
          rejectreason,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleRejectReasonToUnified(
    rejectreason: AshbyRejectReasonOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedRejectReasonOutput> {
    return {
      remote_id: rejectreason.id,
      remote_data: rejectreason,
      name: rejectreason.text || null,
    };
  }
}
