import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedTicketingAttachmentInput,
  UnifiedTicketingAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { GorgiasAttachmentOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GorgiasAttachmentMapper implements IAttachmentMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'attachment',
      'gorgias',
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
    source: GorgiasAttachmentOutput | GorgiasAttachmentOutput[],
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
    attachment: GorgiasAttachmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingAttachmentOutput> {
    return {
      remote_data: attachment,
      file_name: attachment.name,
      file_url: attachment.url,
    };
  }
}
