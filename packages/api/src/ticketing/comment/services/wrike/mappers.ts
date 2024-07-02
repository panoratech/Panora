import { MappersRegistry } from "@@core/utils/registry/mappings.registry";
import { CoreUnification } from "@@core/utils/services/core.service";
import { Injectable } from "@nestjs/common";
import { Utils } from "@ticketing/@lib/@utils";
import { ICommentMapper } from "@ticketing/comment/types";
import { UnifiedCommentInput, UnifiedCommentOutput } from "@ticketing/comment/types/model.unified";
import { WrikeCommentInput, WrikeCommentOutput } from "./types";
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { TicketingObject } from "@ticketing/@lib/@types";
import { UnifiedAttachmentOutput } from "@ticketing/attachment/types/model.unified";

@Injectable()
export class WrikeCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnification: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ticketing', 'comment', 'wrike', this);
  }
  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WrikeCommentInput> {
    const result: WrikeCommentInput = {
      body: source.body,
      author_id: await this.utils.getUserRemoteIdFromUuid(source.user_id),
      attachments: source.attachments,
    };
    return result;
  }

  async unify(
    source: WrikeCommentOutput | WrikeCommentOutput[],
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
    comment: WrikeCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    let opts;

    if (comment.attachments && comment.attachments.length > 0) {
      const unifiedObject = (await this.coreUnification.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'wrike',
        vertical: 'ticketing',
        customFieldMappings: [],
      })) as UnifiedAttachmentOutput[];

      opts = { ...opts, attachments: unifiedObject };
    }

    if (comment.author.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author.id),
        'wrike',
      );

      if (user_id) {
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