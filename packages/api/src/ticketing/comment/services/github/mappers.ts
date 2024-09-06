import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedTicketingCommentInput,
  UnifiedTicketingCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { GithubCommentInput, GithubCommentOutput } from './types';

@Injectable()
export class GithubCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'github',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GithubCommentInput> {
    // project_id and issue_id will be extracted and used so We do not need to set user (author) field here

    // TODO - Add attachments attribute

    const result: GithubCommentInput = {
      body: source.body,
    };
    return result;
  }

  async unify(
    source: GithubCommentOutput | GithubCommentOutput[],
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
    comment: GithubCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    let opts: any = {};

    // Here Github represent Attachment as URL in body of comment as Markdown so we do not have to store in attachement unified object.

    if (comment.user.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.user.id),
        connectionId,
      );
      if (user_id) {
        opts = { ...opts, user_id };
      }
    }
    // GithubCommentOutput does not contain id of issue that it is assciated

    return {
      remote_id: String(comment.id),
      remote_data: comment,
      body: comment.body || null,
      creator_type: 'USER',
      ...opts,
    };
  }
}
