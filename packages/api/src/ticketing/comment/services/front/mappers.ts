import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { FrontCommentInput, FrontCommentOutput } from './types';

export class FrontCommentMapper implements ICommentMapper {
  desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontCommentInput {
    //TODO
    return;
  }

  unify(
    source: FrontCommentOutput | FrontCommentOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCommentOutput | UnifiedCommentOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleCommentToUnified(source, customFieldMappings);
    }
    return source.map((comment) =>
      this.mapSingleCommentToUnified(comment, customFieldMappings),
    );
  }

  private mapSingleCommentToUnified(
    comment: FrontCommentOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCommentOutput {
    /*TODO const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: comment.custom_fields[mapping.remote_id],
    }));*/
    return;
  }
}
