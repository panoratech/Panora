import { ICommentMapper } from '@ticketing/comment/types';
import { ZendeskCommentInput, ZendeskCommentOutput } from './types';
import {
  UnifiedTicketingCommentInput,
  UnifiedTicketingCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { UnifiedTicketingAttachmentOutput } from '@ticketing/attachment/types/model.unified';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ZendeskAttachmentOutput } from '@ticketing/attachment/services/zendesk/types';
@Injectable()
export class ZendeskCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'zendesk',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskCommentInput> {
    const result: ZendeskCommentInput = {
      body: source.body,
      public: source.is_private ? !source.is_private : true,
      type: 'Comment',
    };

    if (source.creator_type === 'USER') {
      result.author_id = Number(
        await this.utils.getUserRemoteIdFromUuid(source.user_id),
      );
    }
    if (source.creator_type === 'CONTACT') {
      result.author_id = Number(
        await this.utils.getContactRemoteIdFromUuid(source.contact_id),
      );
    }

    if (source.attachments) {
      // it is a string array of uuids of attachmts objects
      result.uploads = source.attachments as string[];
    }

    if (source.html_body) {
      result.html_body = source.html_body;
    }

    return result;
  }

  async unify(
    source: ZendeskCommentOutput | ZendeskCommentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput | UnifiedTicketingCommentOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleCommentToUnified(
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
    comment: ZendeskCommentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingCommentOutput> {
    let opts: any = {};

    if (comment.attachments && comment.attachments.length > 0) {
      const attachments = (await this.coreUnificationService.unify<
        OriginalAttachmentOutput[]
      >({
        sourceObject: comment.attachments,
        targetType: TicketingObject.attachment,
        providerName: 'zendesk',
        vertical: 'ticketing',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedTicketingAttachmentOutput[];
      opts = {
        ...opts,
        attachments: attachments,
      };
    }

    if (comment.author_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.author_id),
        connectionId,
      );

      if (user_id) {
        opts = { ...opts, user_id: user_id, creator_type: 'USER' };
      } else {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          String(comment.author_id),
          connectionId,
        );
        if (contact_id) {
          opts = { ...opts, creator_type: 'CONTACT', contact_id: contact_id };
        }
      }
    }

    return {
      remote_id: String(comment.id),
      remote_data: comment,
      body: comment.body || null,
      html_body: comment.html_body || null,
      is_private: !comment.public,
      ...opts,
    };
  }
}
