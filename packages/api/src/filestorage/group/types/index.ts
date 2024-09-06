import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedFilestorageGroupInput, UnifiedFilestorageGroupOutput } from './model.unified';
import { OriginalGroupOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IGroupService extends IBaseObjectService {
  addGroup?(
    permissionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalGroupOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalGroupOutput[]>>;
}

export interface IGroupMapper {
  desunify(
    source: UnifiedFilestorageGroupInput,
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
  ): Promise<UnifiedFilestorageGroupOutput | UnifiedFilestorageGroupOutput[]>;
}
