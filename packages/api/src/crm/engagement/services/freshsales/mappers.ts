import { IEngagementMapper } from '@crm/engagement/types';
import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import {
  FreshsalesEngagementInput,
  FreshsalesEngagementOutput,
} from '@crm/@utils/@types';

//TODO
export class FreshsalesEngagementMapper implements IEngagementMapper {
  desunify(source: UnifiedEngagementInput): FreshsalesEngagementInput {
    return;
  }

  unify(
    source: FreshsalesEngagementOutput | FreshsalesEngagementOutput[],
  ): UnifiedEngagementOutput | UnifiedEngagementOutput[] {
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
