import { PipedriveStageInput, PipedriveStageOutput } from './types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';

export class PipedriveStageMapper implements IStageMapper {
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveStageInput {
    return;
  }

  unify(
    source: PipedriveStageOutput | PipedriveStageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput | UnifiedStageOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleStageToUnified(source, customFieldMappings);
    }

    // Handling array of PipedriveStageOutput
    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: PipedriveStageOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = stage[mapping.remote_id];
      }
    }

    return {
      stage_name: stage.name,
      field_mappings,
    };
  }
}
