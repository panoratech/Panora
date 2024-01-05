import { ICommentMapper } from '@ticketing/comment/types';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class ZendeskCommentMapper implements ICommentMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskCommentInput> {
    const result: ZendeskCommentInput = {
      body: source.body,
      html_body: source.html_body,
      public: !source.is_private,
      author_id: source.user_id
        ? parseInt(source.user_id)
        : source.contact_id
        ? parseInt(source.contact_id)
        : undefined, //TODO: make sure either one is passed
      type: 'Comment',
      uploads: source.attachments
        ? await this.utils.get_Zendesk_AttachmentsTokensFromUuid(
            source.attachments,
          )
        : [], //fetch token attachments for this uuid
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
      body: comment.body || '',
      html_body: comment.html_body || '',
      is_private: !comment.public,
      created_at: new Date(comment.created_at),
      modified_at: new Date(comment.created_at), // Assuming the creation date for modification as well
      creator_type: 'contact',
      ticket_id: '', //TODO
      contact_id: '', // TODO:
      user_id: '', //TODO
    };
  }
}
