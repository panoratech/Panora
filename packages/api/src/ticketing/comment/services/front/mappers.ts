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

export class FrontCommentMapper implements ICommentMapper {
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

    return {
      body: comment.body,
      html_body: '',
      creator_type: comment.author ? 'contact' : null,
      ticket_id: '', // TODO: Need to be determined from related data
      contact_id: '', // TODO: Need to be determined from related data
      user_id: '', //TODO
      attachments: unifiedObject,
    };
  }
}
