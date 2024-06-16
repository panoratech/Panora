import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from './model.unified';
import { OriginalPermissionOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface IPermissionService {
  addPermission(
    permissionData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPermissionOutput>>;

  syncPermissions(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPermissionOutput[]>>;
}

export interface IPermissionMapper {
  desunify(
    source: UnifiedPermissionInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPermissionOutput | OriginalPermissionOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedPermissionOutput | UnifiedPermissionOutput[];
}
