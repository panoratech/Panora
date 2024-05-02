import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { FrontCommentInput, FrontCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@lib/@types';
import { unify } from '@@core/utils/unification/unify';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';;

export class FrontCommentMapper implements ICommentMapper {
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
  ): Promise<FrontCommentInput> {
    const result: FrontCommentInput = {
      body: source.body,
      author_id: await this.utils.getUserRemoteIdFromUuid(source.user_id), // for Front it must be a User
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
    let opts;

    if (comment.attachments && comment.attachments.length > 0) {
      const unifiedObject = (await unify<OriginalAttachmentOutput[]>({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'front',
        vertical: 'ticketing',
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];

      opts = { ...opts, attachments: unifiedObject };
    }

    if (comment.author.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author.id),
        'front',
      );

      if (user_id) {
        // we must always fall here for Front
        opts = { user_id: user_id, creator_type: 'USER' };
      }
    }

    const res = {
      body: comment.body,
      ...opts,
    };

    return res;
  }
}
