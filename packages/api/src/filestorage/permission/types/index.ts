import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedFilestoragePermissionInput,
  UnifiedFilestoragePermissionOutput,
} from './model.unified';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IPermissionService extends IBaseObjectService {
  addPermission?(
    permissionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPermissionOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalPermissionOutput[]>>;
}

export interface IPermissionMapper {
  desunify(
    source: UnifiedFilestoragePermissionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPermissionOutput | OriginalPermissionOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestoragePermissionOutput | UnifiedFilestoragePermissionOutput[]>;
}
