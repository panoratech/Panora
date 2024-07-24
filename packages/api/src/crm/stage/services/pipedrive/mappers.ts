import { PipedriveStageInput, PipedriveStageOutput } from './types';
import {
  UnifiedCrmStageInput,
  UnifiedCrmStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class PipedriveStageMapper implements IStageMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'stage', 'pipedrive', this);
  }
  desunify(
    source: UnifiedCrmStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveStageInput {
    return;
  }

  unify(
    source: PipedriveStageOutput | PipedriveStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput | UnifiedCrmStageOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleStageToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    // Handling array of PipedriveStageOutput
    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, connectionId, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: PipedriveStageOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = stage[mapping.remote_id];
      }
    }

    return {
      remote_id: String(stage.id),
      remote_data: stage,
      stage_name: stage.name,
      field_mappings,
    };
  }
}
