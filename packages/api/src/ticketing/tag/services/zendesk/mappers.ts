import { ITagMapper } from '@ticketing/tag/types';
import { ZendeskTagInput, ZendeskTagOutput } from './types';
import {
  UnifiedTagInput,
  UnifiedTagOutput,
} from '@ticketing/tag/types/model.unified';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class ZendeskTagMapper implements ITagMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'tag', 'zendesk', this);
  }
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput | UnifiedTagOutput[] {
    if (!source) return [];

    return source.map((tag) =>
      this.mapSingleTagToUnified(tag, connectionId, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTagOutput {
    const unifiedTag: UnifiedTagOutput = {
      id: `zendesk_tag_uuid_${tag}`,
      remote_id: `zendesk_tag_uuid_${tag}`,
      // this is used so we can have a remote_id inside our Tag table
      //this id is a fake id put in place as Zendesk does not store any uuid for it,it must not be onsidered the same as the uuid from panora which is stored also in this id field
      // actually this fake id would be just used inside the sync function SHORT TERM and would be replaced in its final form by the real uuid inside Panora db
      name: tag,
    };

    return unifiedTag;
  }
}
