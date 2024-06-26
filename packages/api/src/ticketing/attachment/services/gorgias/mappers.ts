import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
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
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<any> {
    return;
  }

  unify(
    source: GorgiasAttachmentOutput | GorgiasAttachmentOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput | UnifiedAttachmentOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleAttachmentToUnified(source, connectionId, customFieldMappings);
    }
    return source.map((attachment) =>
      this.mapSingleAttachmentToUnified(attachment, connectionId, customFieldMappings),
    );
  }

  private mapSingleAttachmentToUnified(
    attachment: GorgiasAttachmentOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput {
    return {
      file_name: attachment.name,
      file_url: attachment.url,
    };
  }
}
