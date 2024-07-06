import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCommentInput, UnifiedCommentOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ICommentService extends IBaseObjectService {
  addComment(
    commentData: DesunifyReturnType,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<OriginalCommentOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalCommentOutput[]>>;
}
export interface ICommentMapper {
  desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCommentOutput | OriginalCommentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]>;
}

export type Comment = {
  remote_id?: string;
  body: string;
  html_body: string;
  is_private: boolean;
};
