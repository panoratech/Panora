import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedFilestorageSharedlinkInput,
  UnifiedFilestorageSharedlinkOutput,
} from './model.unified';
import { OriginalSharedLinkOutput } from '@@core/utils/types/original/original.file-storage';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ISharedLinkService extends IBaseObjectService {
  addSharedLink?(
    sharedlinkData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalSharedLinkOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalSharedLinkOutput[]>>;
}

export interface ISharedLinkMapper {
  desunify(
    source: UnifiedFilestorageSharedlinkInput,
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
  ): Promise<UnifiedFilestorageSharedlinkOutput | UnifiedFilestorageSharedlinkOutput[]>;
}
