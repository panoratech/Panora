import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedFolderInput, UnifiedFolderOutput } from './model.unified';
import { OriginalFolderOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface IFolderService {
  addFolder(
    folderData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFolderOutput>>;

  syncFolders(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalFolderOutput[]>>;
}

export interface IFolderMapper {
  desunify(
    source: UnifiedFolderInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalFolderOutput | OriginalFolderOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedFolderOutput | UnifiedFolderOutput[];
}
