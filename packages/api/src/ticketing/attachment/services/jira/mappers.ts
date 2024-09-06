import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedTicketingAttachmentInput,
  UnifiedTicketingAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { JiraAttachmentOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class JiraAttachmentMapper implements IAttachmentMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'attachment',
      'jira',
      this,
    );
  }
  async desunify(
    source: UnifiedTicketingAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<any> {
    return;
  }

  async unify(
    source: JiraAttachmentOutput | JiraAttachmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingAttachmentOutput | UnifiedTicketingAttachmentOutput[]> {
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
    attachment: JiraAttachmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingAttachmentOutput> {
    let opts = {};
    if (attachment.author.accountId) {
      // todo : determiner qui est l'uploader ?
      const id_user = await this.utils.getUserUuidFromRemoteId(
        attachment.author.accountId,
        connectionId,
      );
      if (id_user) {
        opts = {
          uploader: id_user,
        };
      }
    }
    return {
      remote_id: attachment.id,
      remote_data: attachment,
      file_name: attachment.name,
      file_url: attachment.url,
      ...opts,
    };
  }
}
