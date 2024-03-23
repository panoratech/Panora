import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { JiraCommentInput, JiraCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@utils/@types';
import { unify } from '@@core/utils/unification/unify';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/comment/utils';

export class JiraCommentMapper implements ICommentMapper {
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
  ): Promise<JiraCommentInput> {
    const result: JiraCommentInput = {
      body: source.body,
      attachments: source.attachments,
    };
    return result;
  }

  async unify(
    source: JiraCommentOutput | JiraCommentOutput[],
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
    comment: JiraCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    //map the jira attachment to our unified version of attachment
    //unifying the original attachment object coming from Jira

    let opts;

    //TODO: find a way to retrieve attachments for jira
    // issue: attachments are tied to issues not comments in Jira

    if (comment.author.accountId) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        comment.author.accountId,
        'jira',
      );

      if (user_id) {
        // we must always fall here for Jira
        opts = { user_id: user_id, creator_type: 'user' };
      }
    }

    const res = {
      body: comment.body,
      ...opts,
    };

    return res;
  }
}
