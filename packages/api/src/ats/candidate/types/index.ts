import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCandidateInput, UnifiedCandidateOutput } from './model.unified';
import { OriginalCandidateOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface ICandidateService {
  addCandidate(
    candidateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCandidateOutput>>;

  syncCandidates(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCandidateOutput[]>>;
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCandidateOutput | UnifiedCandidateOutput[];
}
