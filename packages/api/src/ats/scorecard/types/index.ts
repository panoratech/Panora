import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedScoreCardInput, UnifiedScoreCardOutput } from './model.unified';
import { OriginalScoreCardOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IScoreCardService {
  addScoreCard(
    scorecardData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalScoreCardOutput>>;

  syncScoreCards(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalScoreCardOutput[]>>;
}

export interface IScoreCardMapper {
  desunify(
    source: UnifiedScoreCardInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalScoreCardOutput | OriginalScoreCardOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedScoreCardOutput | UnifiedScoreCardOutput[];
}
