import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedFileInput, UnifiedFileOutput } from './model.unified';
import { OriginalFileOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface IFileService {
  addFile(
    fileData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalFileOutput>>;

  syncFiles(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalFileOutput[]>>;
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedFileOutput | UnifiedFileOutput[];
}
