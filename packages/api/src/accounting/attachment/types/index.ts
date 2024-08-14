import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingAttachmentInput,
  UnifiedAccountingAttachmentOutput,
} from './model.unified';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IAttachmentService {
  addAttachment(
    attachmentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalAttachmentOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalAttachmentOutput[]>>;
}

export interface IAttachmentMapper {
  desunify(
    source: UnifiedAccountingAttachmentInput,
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
  ): Promise<
    UnifiedAccountingAttachmentOutput | UnifiedAccountingAttachmentOutput[]
  >;
}
