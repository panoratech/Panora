import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTagInput, UnifiedTagOutput } from './model.unified';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ITagService extends IBaseObjectService {
  addTag(
    tagData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTagOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTagOutput[]>>;
}

export interface ITagMapper {
  desunify(
    source: UnifiedTagInput,
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
  ): Promise<UnifiedTagOutput | UnifiedTagOutput[]>;
}
