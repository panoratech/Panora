import { ICommentMapper } from '@ticketing/comment/types';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { unify } from '@@core/utils/unification/unify';
import { TicketingObject } from '@ticketing/@lib/@types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';

export class ZendeskCommentMapper implements ICommentMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskCommentInput> {
    const result: ZendeskCommentInput = {
      body: source.body,
      public: source.is_private ? !source.is_private : true,
      type: 'Comment',
    };

    if (source.creator_type === 'USER') {
      result.author_id = Number(
        await this.utils.getUserRemoteIdFromUuid(source.user_id),
      );
    }
    if (source.creator_type === 'CONTACT') {
      result.author_id = Number(
        await this.utils.getContactRemoteIdFromUuid(source.contact_id),
      );
    }

    if (source.attachments) {
      result.uploads = source.attachments; //we let the array of uuids on purpose (it will be modified in the given service on the fly!)
    }

    if (source.html_body) {
      result.html_body = source.html_body;
    }

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
    let opts;

    if (comment.attachments && comment.attachments.length > 0) {
      const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'zendesk',
        vertical: 'ticketing',
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];

      opts = { ...opts, attachments: unifiedObject };
    }

    if (comment.author_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author_id),
        'zendesk',
      );

      if (user_id) {
        opts = { user_id: user_id, creator_type: 'USER' };
      } else {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          String(comment.author_id),
          'zendesk',
        );
        if (contact_id) {
          opts = { creator_type: 'CONTACT', contact_id: contact_id };
        }
      }
    }

    const res = {
      body: comment.body || '',
      html_body: comment.html_body || '',
      is_private: !comment.public,
      ...opts,
    };

    return {
      remote_id: String(comment.id),
      ...res,
    };
  }
}
