import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTagInput, UnifiedTagOutput } from './model.unified';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface ITagService {
  addTag(
    tagData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTagOutput>>;

  syncTags(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTagOutput[]>>;
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[];
}
