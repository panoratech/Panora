import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCommentInput, UnifiedCommentOutput } from './model.unified';
import { OriginalCommentOutput } from '@@core/utils/types/original.output';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';

export interface ICommentService {
  addComment(
    commentData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCommentOutput>>;

  syncComments(
    linkedUserId: string,
    custom_properties?: string[],
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
  ): UnifiedCommentOutput | UnifiedCommentOutput[];
}

export type Comment = {
  remote_id?: string;
  body: string;
  html_body: string;
  is_private: boolean;
};

export class CommentResponse {
  @ApiProperty({ type: [UnifiedCommentOutput] })
  comments: UnifiedCommentOutput[];
  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; //data in original format
}
