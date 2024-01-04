import { ICommentMapper } from '@ticketing/comment/types';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';

export class ZendeskCommentMapper implements ICommentMapper {
  desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskCommentInput {
    const result: ZendeskCommentInput = {
      body: source.body,
      html_body: source.html_body,
      public: !source.is_private,
      author_id: source.user_id ? parseInt(source.user_id) : undefined,
      type: 'Comment',
    };

    return result;
  }

  unify(
    source: ZendeskCommentOutput | ZendeskCommentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCommentOutput | UnifiedCommentOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleCommentToUnified(source, customFieldMappings);
    }
    return source.map((comment) =>
      this.mapSingleCommentToUnified(comment, customFieldMappings),
    );
  }

  private mapSingleCommentToUnified(
    comment: ZendeskCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCommentOutput {
    return {
      id: comment.id.toString(),
      body: comment.body || '',
      html_body: comment.html_body || '',
      is_private: !comment.public,
      created_at: new Date(comment.created_at),
      modified_at: new Date(comment.created_at), // Assuming the creation date for modification as well
      creator_type: null, //TODO
      ticket_id: '', //TODO
    };
  }
}
