import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';
import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedTicketingCommentInput,
  UnifiedTicketingCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { JiraCommentInput, JiraCommentOutput } from './types';
import { OriginalCommentOutput } from '@@core/utils/types/original/original.ticketing';
@Injectable()
export class JiraCommentMapper implements ICommentMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'comment', 'jira', this);
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<JiraCommentInput> {
    const result: JiraCommentInput = {
      body: {
        content: [
          {
            content: [
              {
                text: source.body,
                type: 'text',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'doc',
        version: 1,
      },
    };
    if (source.attachments) {
      result.attachments = source.attachments as string[];
    }
    return result;
  }

  async unify(
    source: JiraCommentOutput | JiraCommentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput | UnifiedTicketingCommentOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleCommentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((comment) =>
        this.mapSingleCommentToUnified(
          comment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleCommentToUnified(
    comment: JiraCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    let opts: any = {};

    if (comment.author.accountId) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        comment.author.accountId,
        connectionId,
      );

      if (user_id) {
        // we must always fall here for Jira
        opts = { ...opts, user_id: user_id, creator_type: 'USER' };
      }
    }
    if (comment.body.content[0].content[0].text) {
      opts.body = comment.body.content[0].content[0].text;
    }

    return {
      remote_id: comment.id,
      remote_data: comment,
      ...opts,
    };
  }
}
