import { ICommentMapper } from '@ticketing/comment/types';
import { GitlabCommentOutput, GitlabCommentInput } from './types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';

export class GitlabCommentMapper implements ICommentMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(source: UnifiedCommentInput): Promise<GitlabCommentInput> {
    const result: GitlabCommentInput = {
      body: source.body,
    };

    return result;
  }

  async unify(
    source: GitlabCommentOutput | GitlabCommentOutput[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCommentToUnified(source);
    }
    return Promise.all(
      source.map((comment) => this.mapSingleCommentToUnified(comment)),
    );
  }

  private async mapSingleCommentToUnified(
    comment: GitlabCommentOutput,
  ): Promise<UnifiedCommentOutput> {
    let opts;

    if (comment?.author?.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author?.id),
        'gitlab',
      );

      if (user_id) {
        opts = { user_id: user_id, creator_type: 'USER' };
      }
    }
    if (comment.noteable_id) {
      const ticket_id = await this.utils.getTicketUuidFromRemoteId(
        String(comment.noteable_iid),
        'gitlab',
      );
      if (ticket_id) {
        opts.ticket_id = ticket_id;
      }
    }

    const res = {
      body: comment.body || '',
      html_body: '',
      is_private: !comment.confidential,
      ...opts,
    };
    return {
      remote_id: String(comment.id),
      ...res,
    };
  }
}
