import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedJobInterviewStageInput,
  UnifiedJobInterviewStageOutput,
} from './model.unified';
import { OriginalJobInterviewStageOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IJobInterviewStageService extends IBaseObjectService {
  addJobInterviewStage(
    jobinterviewstageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJobInterviewStageOutput>>;

  sync(
    data: SyncParam,
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJobInterviewStageOutput | UnifiedJobInterviewStageOutput[]>;
}
