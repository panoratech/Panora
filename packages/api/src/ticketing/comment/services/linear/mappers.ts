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
import { LinearCommentInput, LinearCommentOutput } from './types';

@Injectable()
export class LinearCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'linear',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<LinearCommentInput> {
    // project_id and issue_id will be extracted and used so We do not need to set user (author) field here

    // TODO - Add attachments attribute

    const result: LinearCommentInput = {
      body: source.body,
    };
    return result;
  }

  async unify(
    source: LinearCommentOutput | LinearCommentOutput[],
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
    comment: LinearCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    let user_id: string;

    if (comment.user.id) {
      user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.user.id),
        connectionId,
      );
    }

    return {
      remote_id: comment.id,
      remote_data: comment,
      body: comment.body || null,
      ticket_id: comment.issue.id,
      user_id: user_id,
      creator_type: 'USER',
    };
  }
}