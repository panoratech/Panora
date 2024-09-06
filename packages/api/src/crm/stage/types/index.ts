import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCrmStageInput, UnifiedCrmStageOutput } from './model.unified';
import { OriginalStageOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IStageService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalStageOutput[]>>;
}

export interface IStageMapper {
  desunify(
    source: UnifiedCrmStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalStageOutput | OriginalStageOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmStageOutput | UnifiedCrmStageOutput[];
}
