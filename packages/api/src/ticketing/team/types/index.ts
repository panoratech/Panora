import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTeamInput, UnifiedTeamOutput } from './model.unified';
import { OriginalTeamOutput } from '@@core/utils/types/original/original.ticketing';
import { ApiResponse } from '@@core/utils/types';

export interface ITeamService {
  syncTeams(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTeamOutput[]>>;
}

export interface ITeamMapper {
  desunify(
    source: UnifiedTeamInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTeamOutput | OriginalTeamOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTeamOutput | UnifiedTeamOutput[];
}
