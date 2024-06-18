import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedDriveInput, UnifiedDriveOutput } from './model.unified';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface IDriveService {
  addDrive(
    driveData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDriveOutput>>;

  syncDrives(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalDriveOutput[]>>;
}

export interface IDriveMapper {
  desunify(
    source: UnifiedDriveInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalDriveOutput | OriginalDriveOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDriveOutput | UnifiedDriveOutput[];
}
