import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  AttachmentType,
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from './model.unified';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ats';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface IAttachmentService extends IBaseObjectService {
  addAttachment?(
    attachmentData: DesunifyReturnType,
    linkedUserId: string,
    attachment_type?: AttachmentType | string,
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
