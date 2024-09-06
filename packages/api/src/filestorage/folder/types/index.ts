import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedFilestorageFolderInput, UnifiedFilestorageFolderOutput } from './model.unified';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IFolderService extends IBaseObjectService {
  addFolder(
    folderData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFolderOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalFolderOutput[]>>;
}

export interface IFolderMapper {
  desunify(
    source: UnifiedFilestorageFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFolderOutput | OriginalFolderOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedFilestorageFolderOutput | UnifiedFilestorageFolderOutput[]>;
}
