import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedRejectreasonInput, UnifiedRejectreasonOutput } from './model.unified';
import { OriginalRejectreasonOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';

export interface IRejectreasonService {
  addRejectreason(
    rejectreasonData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalRejectreasonOutput>>;

  syncRejectreasons(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalRejectreasonOutput[]>>;
}

export interface IRejectreasonMapper {
  desunify(
    source: UnifiedRejectreasonInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalRejectreasonOutput | OriginalRejectreasonOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedRejectreasonOutput | UnifiedRejectreasonOutput[];
}
