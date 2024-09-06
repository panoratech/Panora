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
import { FrontCommentInput, FrontCommentOutput } from './types';

@Injectable()
export class FrontCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ticketing', 'comment', 'front', this);
  }
  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<FrontCommentInput> {
    const result: FrontCommentInput = {
      body: source.body,
      author_id: await this.utils.getUserRemoteIdFromUuid(source.user_id), // for Front it must be a User
      attachments: source.attachments as string[],
    };
    return result;
  }

  async unify(
    source: FrontCommentOutput | FrontCommentOutput[],
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
    comment: FrontCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    //map the front attachment to our unified version of attachment
    //unifying the original attachment object coming from Front
    let opts: any = {};

    if (comment.attachments && comment.attachments.length > 0) {
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'front',
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
        // we must always fall here for Front
        opts = { ...opts, user_id: user_id, creator_type: 'USER' };
      }
    }

    return {
      remote_id: comment.id,
      remote_data: comment,
      body: comment.body,
      ...opts,
    };
  }
}
