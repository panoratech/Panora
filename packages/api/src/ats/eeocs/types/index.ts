import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedEeocsInput, UnifiedEeocsOutput } from './model.unified';
import { OriginalEeocsOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IEeocsService {
  addEeocs(
    eeocsData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalEeocsOutput>>;

  syncEeocss(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalEeocsOutput[]>>;
}

export interface IEeocsMapper {
  desunify(
    source: UnifiedEeocsInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalEeocsOutput | OriginalEeocsOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedEeocsOutput | UnifiedEeocsOutput[];
}
