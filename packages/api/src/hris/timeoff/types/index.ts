import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTimeoffInput, UnifiedTimeoffOutput } from './model.unified';
import { OriginalTimeoffOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface ITimeoffService {
  addTimeoff(
    timeoffData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTimeoffOutput>>;

  syncTimeoffs(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTimeoffOutput[]>>;
}

export interface ITimeoffMapper {
  desunify(
    source: UnifiedTimeoffInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTimeoffOutput | OriginalTimeoffOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTimeoffOutput | UnifiedTimeoffOutput[]>;
}
