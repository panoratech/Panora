import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedGroupInput, UnifiedGroupOutput } from './model.unified';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';

export interface IGroupService {
  addGroup(
    groupData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalGroupOutput>>;

  syncGroups(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalGroupOutput[]>>;
}

export interface IGroupMapper {
  desunify(
    source: UnifiedGroupInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalGroupOutput | OriginalGroupOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedGroupOutput | UnifiedGroupOutput[]>;
}
