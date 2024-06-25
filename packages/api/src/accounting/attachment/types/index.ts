import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from './model.unified';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IAttachmentService {
  addAttachment(
    attachmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAttachmentOutput>>;

  syncAttachments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalAttachmentOutput[]>>;
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
