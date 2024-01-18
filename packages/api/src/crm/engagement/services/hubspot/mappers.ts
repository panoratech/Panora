import {
  HubspotEngagementInput,
  HubspotEngagementOutput,
} from '@crm/@utils/@types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';

export class HubspotEngagementMapper implements IEngagementMapper {
  desunify(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotEngagementInput {
    return;
  }

  unify(
    source: HubspotEngagementOutput | HubspotEngagementOutput[],
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
    engagement: HubspotEngagementOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEngagementOutput {
    return;
  }
}
