import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedAtsTagInput, UnifiedAtsTagOutput } from './model.unified';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ITagService extends IBaseObjectService {
  sync(data: SyncParam): Promise<ApiResponse<OriginalTagOutput[]>>;
}

export interface ITagMapper {
  desunify(
    source: UnifiedAtsTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTagOutput | OriginalTagOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAtsTagOutput | UnifiedAtsTagOutput[]>;
}
