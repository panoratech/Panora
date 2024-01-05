import { IAttachmentMapper } from '@ticketing/attachment/types';
import { GithubAttachmentInput, GithubAttachmentOutput } from './types';
import {
  UnifiedAttachmentInput,
  UnifiedAttachmentOutput,
} from '@ticketing/attachment/types/model.unified';

export class GithubAttachmentMapper implements IAttachmentMapper {
  desunify(
    source: UnifiedAttachmentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GithubAttachmentInput {
    return;
  }

  unify(
    source: GithubAttachmentOutput | GithubAttachmentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedAttachmentOutput | UnifiedAttachmentOutput[] {
    return;
  }
}
