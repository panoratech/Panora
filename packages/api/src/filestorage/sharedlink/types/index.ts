import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from './model.unified';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';

export interface ISharedLinkService {
  addSharedLink?(
    sharedlinkData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalSharedLinkOutput>>;

  syncSharedLinks(
    linkedUserId: string,
    extra?: { object_name: 'folder' | 'file'; value: string },
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalSharedLinkOutput[]>>;
}

export interface ISharedLinkMapper {
  desunify(
    source: UnifiedSharedLinkInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalSharedLinkOutput | OriginalSharedLinkOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedSharedLinkOutput | UnifiedSharedLinkOutput[]>;
}
