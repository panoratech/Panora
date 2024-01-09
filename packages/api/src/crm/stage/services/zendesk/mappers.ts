import { ZendeskStageInput, ZendeskStageOutput } from '@crm/@utils/@types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';

export class ZendeskStageMapper implements IStageMapper {
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskStageInput {
    return;
  }

  unify(
    source: ZendeskStageOutput | ZendeskStageOutput[],
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
    stage: ZendeskStageOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput {
    return;
  }
}
