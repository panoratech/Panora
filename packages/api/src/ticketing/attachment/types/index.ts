import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IAttachmentService extends IBaseObjectService {
  addAttachment(
    attachmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAttachmentOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalAttachmentOutput[]>>;
}

export interface IAttachmentMapper {
  desunify(
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalAttachmentOutput | OriginalAttachmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAttachmentOutput | UnifiedAttachmentOutput[]>;
}
