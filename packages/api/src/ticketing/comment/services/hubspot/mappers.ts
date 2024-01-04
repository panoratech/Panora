import { ICommentMapper } from '@ticketing/comment/types';
import {
  UnifiedCommentInput,
  UnifiedCommentOutput,
} from '@ticketing/comment/types/model.unified';
import { HubspotCommentInput, HubspotCommentOutput } from './types';

//TODO: HUBSPOT DOES NOT HAVE A COMMENT ENDPOINT
export class HubspotCommentMapper implements ICommentMapper {
  desunify(
    source: UnifiedCommentInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotCommentInput {
    //TODO
    return;
  }

  unify(
    source: HubspotCommentOutput | HubspotCommentOutput[],
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
    comment: HubspotCommentOutput,
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
