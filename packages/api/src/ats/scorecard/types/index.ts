import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedScorecardInput, UnifiedScorecardOutput } from './model.unified';
import { OriginalScorecardOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IScorecardService {
  addScorecard(
    scorecardData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalScorecardOutput>>;

  syncScorecards(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalScorecardOutput[]>>;
}

export interface IScorecardMapper {
  desunify(
    source: UnifiedScorecardInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalScorecardOutput | OriginalScorecardOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedScorecardOutput | UnifiedScorecardOutput[];
}
