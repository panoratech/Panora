import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { GorgiasAttachmentOutput } from './types';

export class GorgiasAttachmentMapper implements IAttachmentMapper {
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput | UnifiedAttachmentOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleAttachmentToUnified(source, customFieldMappings);
    }
    return source.map((attachment) =>
      this.mapSingleAttachmentToUnified(attachment, customFieldMappings),
    );
  }

  private mapSingleAttachmentToUnified(
    attachment: GorgiasAttachmentOutput,
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
