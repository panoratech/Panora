import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { JiraAttachmentOutput } from './types';

//TODO:
export class JiraAttachmentMapper implements IAttachmentMapper {
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
    source: JiraAttachmentOutput | JiraAttachmentOutput[],
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
    attachment: JiraAttachmentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput {
    return;
  }
}
