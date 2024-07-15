import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedScoreCardInput, UnifiedScoreCardOutput } from './model.unified';
import { OriginalScoreCardOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IScoreCardService extends IBaseObjectService {
  addScoreCard(
    scorecardData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalScoreCardOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalScoreCardOutput[]>>;
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedScoreCardOutput | UnifiedScoreCardOutput[]>;
}
