import { IEngagementMapper } from '@crm/engagement/types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { FreshsalesEngagementInput, FreshsalesEngagementOutput } from './types';

//TODO
export class FreshsalesEngagementMapper implements IEngagementMapper {
  desunify(source: UnifiedEngagementInput): FreshsalesEngagementInput {
    return;
  }

  async unify(
    source: FreshsalesEngagementOutput | FreshsalesEngagementOutput[],
    engagement_type: string,
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    // Handling single FreshsalesEngagementOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesEngagementToUnified(source);
    }

    // Handling array of FreshsalesEngagementOutput
    return source.map((engagement) =>
      this.mapSingleFreshsalesEngagementToUnified(engagement),
    );
  }

  private mapSingleFreshsalesEngagementToUnified(
    engagement: FreshsalesEngagementOutput,
  ): UnifiedEngagementOutput {
    return;
  }
}
