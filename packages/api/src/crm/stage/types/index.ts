import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedStageInput, UnifiedStageOutput } from './model.unified';
import { OriginalStageOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface IStageService {
  addStage(
    stageData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalStageOutput>>;

  syncStages(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalStageOutput[]>>;
}

export interface IStageMapper {
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalStageOutput | OriginalStageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput | UnifiedStageOutput[];
}
