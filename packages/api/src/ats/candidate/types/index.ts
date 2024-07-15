import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCandidateInput, UnifiedCandidateOutput } from './model.unified';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ICandidateService extends IBaseObjectService {
  addCandidate(
    candidateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCandidateOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalCandidateOutput[]>>;
}

export interface ICandidateMapper {
  desunify(
    source: UnifiedCandidateInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCandidateOutput | OriginalCandidateOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCandidateOutput | UnifiedCandidateOutput[]>;
}
