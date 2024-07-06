import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedDriveInput, UnifiedDriveOutput } from './model.unified';
import { OriginalDriveOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IDriveService extends IBaseObjectService {
  addDrive(
    driveData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalDriveOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalDriveOutput[]>>;
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDriveOutput | UnifiedDriveOutput[]>;
}
