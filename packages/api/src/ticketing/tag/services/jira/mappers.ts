import { ITagMapper } from '@ticketing/tag/types';
import { JiraTagInput, JiraTagOutput } from './types';
import {
  UnifiedTicketingTagInput,
  UnifiedTicketingTagOutput,
} from '@ticketing/tag/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class JiraTagMapper implements ITagMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'tag', 'jira', this);
  }
  desunify(
    source: UnifiedTicketingTagInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraTagInput {
    return;
  }

  unify(
    source: JiraTagOutput | JiraTagOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTagOutput | UnifiedTicketingTagOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((tag) =>
      this.mapSingleTagToUnified(tag, connectionId, customFieldMappings),
    );
  }

  private mapSingleTagToUnified(
    tag: JiraTagOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingTagOutput {
    const unifiedTag: UnifiedTicketingTagOutput = {
      remote_id: tag.id ?? null,
      remote_data: tag,
      name: tag.name,
    };

    return unifiedTag;
  }
}
