import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { JiraCommentInput, JiraCommentOutput } from './types';
import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { TicketingObject } from '@ticketing/@lib/@types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
@Injectable()
export class JiraCommentMapper implements ICommentMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'comment', 'jira', this);
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
    };
    if (source.attachments) {
      result.attachments = source.attachments;
    }
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
        opts = { user_id: user_id, creator_type: 'USER' };
      }
    }

    const res = {
      body: comment.body,
      ...opts,
    };

    return {
      remote_id: comment.id,
      ...res,
    };
  }
}
