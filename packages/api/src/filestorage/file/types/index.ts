import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from './model.unified';
export interface IFileService extends IBaseObjectService {
  addFile?(
    fileData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFileOutput>>;

  downloadFile?(fileId: string, connection: any): Promise<Buffer>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalFileOutput[]>>;
}

export interface IFileMapper {
  desunify(
    source: UnifiedFilestorageFileInput,
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
  ): Promise<UnifiedFilestorageFileOutput | UnifiedFilestorageFileOutput[]>;
}
