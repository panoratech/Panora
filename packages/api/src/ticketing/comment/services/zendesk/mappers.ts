import { ICommentMapper } from '@ticketing/comment/types';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@utils/@types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';

export class ZendeskCommentMapper implements ICommentMapper {
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
      uploads: source.attachments, //we let the array of uuids on purpose (it will be modified in the given service on the fly!)
    };

    return result;
  }

  async unify(
    source: ZendeskCommentOutput | ZendeskCommentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCommentToUnified(source, customFieldMappings);
    }
    return Promise.all(
      source.map((comment) =>
        this.mapSingleCommentToUnified(comment, customFieldMappings),
      ),
    );
  }

  private async mapSingleCommentToUnified(
    comment: ZendeskCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
      sourceObject: comment.attachments,
      targetType: TicketingObject.attachment,
      providerName: 'front',
      customFieldMappings: [],
    })) as UnifiedAttachmentOutput[];

    return {
      body: comment.body || '',
      html_body: comment.html_body || '',
      is_private: !comment.public,
      creator_type: 'contact',
      ticket_id: '', //TODO
      contact_id: '', // TODO:
      user_id: '', //TODO
      attachments: unifiedObject,
    };
  }
}
