import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { FrontCommentInput, FrontCommentOutput } from './types';

export class FrontCommentMapper implements ICommentMapper {
  desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontCommentInput {
    const result: FrontCommentInput = {
      body: source.body,
      author_id: source.user_id || source.contact_id, //TODO:
    };

    return result;
  }

  unify(
    source: FrontCommentOutput | FrontCommentOutput[],
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
    comment: FrontCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCommentOutput {
    return {
      id: comment.id,
      body: comment.body,
      html_body: '',
      created_at: new Date(comment.posted_at * 1000), // Convert UNIX timestamp to Date
      modified_at: new Date(), // Placeholder, as modified_at is not available
      author_type: comment.author ? 'user' : null,
      ticket_id: '', // TODO: Need to be determined from related data
      contact_id: '', // TODO: Need to be determined from related data
      user_id: '', //TODO
    };
  }
}
