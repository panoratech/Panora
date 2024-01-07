import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { FrontCommentInput, FrontCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@utils/@types';
import { unify } from '@@core/utils/unification/unify';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/comment/utils';

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
      author_id: source.user_id || source.contact_id, // for Front it must be a User
      attachments: source.attachments,
    };
    return result;
  }

  async unify(
    source: FrontCommentOutput | FrontCommentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCommentToUnified(source, customFieldMappings);
    }
    return Promise.all(
      source.map((comment) =>
        this.mapSingleCommentToUnified(comment, customFieldMappings),
      ),
    );
  }

  private async mapSingleCommentToUnified(
    comment: FrontCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    //map the front attachment to our unified version of attachment
    //unifying the original attachment object coming from Front
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
      body: comment.body,
      creator_type: creator_type, //it must be user
      attachments: unifiedObject,
      ...opts,
    };

    return res;
  }
}
