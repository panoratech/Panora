import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedFileInput, UnifiedFileOutput } from './model.unified';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IFileService extends IBaseObjectService {
  addFile?(
    fileData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFileOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalFileOutput[]>>;
}

export interface IFileMapper {
  desunify(
    source: UnifiedFileInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFileOutput | OriginalFileOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFileOutput | UnifiedFileOutput[]>;
}
