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
import { Utils } from '@ticketing/comment/utils';

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
        : parseInt(source.contact_id), // either one must be passed
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
    const user_id = await this.utils.getUserUuidFromRemoteId(
      String(comment.id),
      'zendesk_tcg',
    );
    let creator_type: string;
    let opts;
    if (user_id) {
      creator_type = 'user';
      opts = { user_id: user_id };
    } else {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        String(comment.id),
        'zendesk_tcg',
      );
      creator_type = 'contact';
      opts = { user_id: contact_id };
    }

    const res = {
      body: comment.body || '',
      html_body: comment.html_body || '',
      is_private: !comment.public,
      creator_type: creator_type,
      attachments: unifiedObject,
      ...opts,
    };

    return res;
  }
}
