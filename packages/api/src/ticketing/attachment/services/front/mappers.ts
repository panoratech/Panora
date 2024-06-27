import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { FrontAttachmentOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class FrontAttachmentMapper implements IAttachmentMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'attachment',
      'front',
      this,
    );
  }
  async desunify(
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: FrontAttachmentOutput | FrontAttachmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAttachmentOutput | UnifiedAttachmentOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleAttachmentToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((attachment) =>
        this.mapSingleAttachmentToUnified(
          attachment,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleAttachmentToUnified(
    attachment: FrontAttachmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAttachmentOutput> {
    let opts = {};
    if (attachment.parent_remote_id) {
      // we might find a comment id tied to it
      const id_comment = await this.utils.getCommentUuidFromRemoteId(
        attachment.parent_remote_id,
        connectionId,
      );
      if (id_comment) {
        opts = {
          comment_id: id_comment,
        };
      }
    }
    return {
      remote_id: attachment.id,
      file_name: attachment.filename,
      file_url: attachment.url,
      ...opts,
    };
  }
}
