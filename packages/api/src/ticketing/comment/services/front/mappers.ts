import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { FrontCommentInput, FrontCommentOutput } from './types';
import { Utils } from '@ticketing/ticket/utils';

export class FrontCommentMapper implements ICommentMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<FrontCommentInput> {
    const result: FrontCommentInput = {
      body: source.body,
      author_id: source.user_id || source.contact_id, //TODO: make sure either one is passed
      attachments: source.attachments,
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
      creator_type: comment.author ? 'contact' : null,
      ticket_id: '', // TODO: Need to be determined from related data
      contact_id: '', // TODO: Need to be determined from related data
      user_id: '', //TODO
    };
  }
}
