import { UnifiedAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { GorgiasCommentInput, GorgiasCommentOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GorgiasCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'gorgias',
      this,
    );
  }

  async desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GorgiasCommentInput> {
    const result: GorgiasCommentInput = {
      sender: {
        id:
          Number(await this.utils.getUserRemoteIdFromUuid(source.user_id)) ||
          Number(
            await this.utils.getContactRemoteIdFromUuid(
              source.user_id || source.contact_id,
            ),
          ),
      },
      via: 'chat',
      from_agent: false,
      channel: 'chat',
      body_html: source.html_body,
      body_text: source.body,
      attachments: source.attachments,
    };
    return result;
  }

  async unify(
    source: GorgiasCommentOutput | GorgiasCommentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput | UnifiedCommentOutput[]> {
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
    comment: GorgiasCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCommentOutput> {
    let opts;

    if (comment.attachments && comment.attachments.length > 0) {
      const results = await this.ingestService.ingestData<
        UnifiedAttachmentOutput,
        OriginalAttachmentOutput
      >(
        comment.attachments.map((attach) => ({
          ...attach,
          parent_remote_id: String(comment.id),
        })),
        'gorgias',
        connectionId,
        'ticketing',
        'attachment',
        [],
      );
      const attachment_ids: string[] = results.map((res) => res.id);

      opts = { ...opts, attachments: attachment_ids };
    }

    if (comment.sender.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.sender.id),
        connectionId,
      );

      if (user_id) {
        opts = { user_id: user_id, creator_type: 'user' };
      } else {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          String(comment.sender.id),
          connectionId,
        );
        if (contact_id) {
          opts = { creator_type: 'CONTACT', contact_id: contact_id };
        }
      }
    }

    return {
      remote_id: String(comment.id),
      body: comment.body_text || null,
      html_body: comment.body_html || null,
      ...opts,
    };
  }
}
