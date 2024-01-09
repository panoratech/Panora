import { PipedriveStageInput, PipedriveStageOutput } from '@crm/@utils/@types';
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

    // Handling array of HubspotStageOutput
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
    return;
  }
}
