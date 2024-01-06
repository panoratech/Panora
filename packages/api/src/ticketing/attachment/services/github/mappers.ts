import { IAttachmentMapper } from '@ticketing/attachment/types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';
import { GithubAttachmentOutput } from './types';

export class GithubAttachmentMapper implements IAttachmentMapper {
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
    source: GithubAttachmentOutput | GithubAttachmentOutput[],
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

  //TODO;
  private mapSingleAttachmentToUnified(
    attachment: GithubAttachmentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput {
    return;
  }
}
