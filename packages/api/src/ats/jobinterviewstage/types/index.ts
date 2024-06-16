import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedJobInterviewStageInput, UnifiedJobInterviewStageOutput } from './model.unified';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IJobInterviewStageService {
  addJobInterviewStage(
    jobinterviewstageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobInterviewStageOutput>>;

  syncJobInterviewStages(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalJobInterviewStageOutput[]>>;
}

export interface IJobInterviewStageMapper {
  desunify(
    source: UnifiedJobInterviewStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalJobInterviewStageOutput | OriginalJobInterviewStageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedJobInterviewStageOutput | UnifiedJobInterviewStageOutput[];
}
