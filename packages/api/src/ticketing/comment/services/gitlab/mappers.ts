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
import { GitlabCommentInput, GitlabCommentOutput } from './types';

@Injectable()
export class GitlabCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'gitlab',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GitlabCommentInput> {
    // project_id and issue_id will be extracted and used so We do not need to set user (author) field here

    // TODO - Add attachments attribute

    const result: GitlabCommentInput = {
      body: source.body,
      internal: source.is_private || false,
    };
    return result;
  }

  async unify(
    source: GitlabCommentOutput | GitlabCommentOutput[],
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
    comment: GitlabCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    let opts: any = {};

    if (comment.attachment && comment.attachment.length > 0) {
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: comment.attachment,
        targetType: TicketingObject.attachment,
        providerName: 'gitlab',
        vertical: 'ticketing',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedTicketingAttachmentOutput[];
      opts = {
        ...opts,
        attachments: attachments,
      };
    }
    if (comment.author.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author.id),
        connectionId,
      );
      if (user_id) {
        opts = { ...opts, user_id };
      }
    }
    if (comment.noteable_id) {
      const ticket_id = await this.utils.getTicketUuidFromRemoteId(
        String(comment.noteable_id),
        connectionId,
      );
      if (ticket_id) {
        opts = { ...opts, ticket_id };
      }
    }

    return {
      remote_id: String(comment.id),
      remote_data: comment,
      body: comment.body || null,
      is_private: comment.internal,
      creator_type: 'USER',
      ...opts,
    };
  }
}
