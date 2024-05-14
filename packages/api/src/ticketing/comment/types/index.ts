import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCommentInput, UnifiedCommentOutput } from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
import { Pagination } from '@ticketing/@lib/@utils';

export interface ICommentService {
  addComment(
    commentData: DesunifyReturnType,
    linkedUserId: string,
    remoteIdTicket: string,
  ): Promise<ApiResponse<OriginalCommentOutput>>;

  syncComments(
    linkedUserId: string,
    idTicket: string,
    custom_properties?: string[],
    pageMeta?: Pagination,
  ): Promise<ApiResponse<OriginalCommentOutput[]>>;
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
