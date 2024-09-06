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
import { GorgiasCommentInput, GorgiasCommentOutput } from './types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class GorgiasCommentMapper implements ICommentMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
    private prisma: PrismaService,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'comment',
      'gorgias',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketingCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GorgiasCommentInput> {
    let uploads = [];
    if (source.attachments) {
      const uuids = source.attachments as string[];
      if (uuids && uuids.length > 0) {
        const attachmentPromises = uuids.map(async (uuid) => {
          const res = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: uuid,
            },
          });
          if (!res) {
            throw new ReferenceError(
              `tcg_attachment not found for uuid ${uuid}`,
            );
          }
          // Assuming you want to construct the right binary attachment here
          // For now, we'll just return the URL
          const stats = fs.statSync(res.file_url);
          return {
            url: res.file_url,
            name: res.file_name,
            size: stats.size,
            content_type: 'application/pdf', //todo
          };
        });
        uploads = await Promise.all(attachmentPromises);
      }
    }
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
    };
    if (uploads && uploads.length > 0) {
      result.attachments = uploads;
    }
    return result;
  }

  async unify(
    source: GorgiasCommentOutput | GorgiasCommentOutput[],
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
    comment: GorgiasCommentOutput,
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

    if (comment.sender.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(comment.sender.id),
        connectionId,
      );

      if (user_id) {
        opts = { ...opts, user_id: user_id, creator_type: 'USER' };
      } else {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          String(comment.sender.id),
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
      body: comment.body_text || null,
      html_body: comment.body_html || null,
      ...opts,
    };
  }
}
