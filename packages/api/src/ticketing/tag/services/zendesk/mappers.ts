import { ITagMapper } from '@ticketing/tag/types';
import { ZendeskTagInput, ZendeskTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';

export class ZendeskTagMapper implements ITagMapper {
  desunify(
    source: UnifiedTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskTagInput {
    return;
  }

  unify(
    source: ZendeskTagOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[] {
    if (!source) return [];

    return source.map((tag) =>
      this.mapSingleTagToUnified(tag, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {

      id: `zendesk_tag_uuid_${tag}`,
      // this is used so we can have a remote_id inside our Tag table
      //this id is a fake id put in place as Zendesk does not store any uuid for it,it must not be onsidered the same as the uuid from panora which is stored also in this id field
      // actually this fake id would be just used inside the sync function SHORT TERM and would be replaced in its final form by the real uuid inside Panora db
      name: tag,
    };

    return unifiedTag;
  }
}
