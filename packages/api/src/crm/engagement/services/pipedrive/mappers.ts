import {
  PipedriveEngagementInput,
  PipedriveEngagementOutput,
} from '@crm/@utils/@types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';

export class PipedriveEngagementMapper implements IEngagementMapper {
  desunify(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveEngagementInput {
    return;
  }

  unify(
    source: PipedriveEngagementOutput | PipedriveEngagementOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEngagementOutput | UnifiedEngagementOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotEngagementOutput
    return source.map((engagement) =>
      this.mapSingleEngagementToUnified(engagement, customFieldMappings),
    );
  }

  private mapSingleEngagementToUnified(
    engagement: PipedriveEngagementOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEngagementOutput {
    return;
  }
}
