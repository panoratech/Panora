import { ITicketMapper } from '@ticketing/ticket/types';
import { GitlabTicketOutput, GitlabTicketInput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
import { UnifiedTagOutput } from '@ats/tag/types/model.unified';
import { OriginalCollectionOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedCollectionOutput } from '@ticketing/collection/types/model.unified';

@Injectable()
export class GitlabTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'gitlab', this);
  }

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GitlabTicketInput> {
    const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
      source.collections[0],
    );

    const result: GitlabTicketInput = {
      title: source.name,
      description: source.description ? source.description : null,
      project_id: Number(remote_project_id),
    };

    if (source.status) {
      result.type = source.status === 'OPEN' ? 'opened' : 'closed';
    }

    if (source.assigned_to && source.assigned_to.length > 0) {
      const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.assigned_to[0],
      );
      result.assignee = {
        id: Number(data),
      };
    }

    if (source.tags) {
      result.labels = source.tags ? source.tags : [];
    }

    // TODO - Custom fields mapping
    // if (customFieldMappings && source.field_mappings) {
    //   result.meta = {}; // Ensure meta exists
    //   for (const [k, v] of Object.entries(source.field_mappings)) {
    //     const mapping = customFieldMappings.find(
    //       (mapping) => mapping.slug === k,
    //     );
    //     if (mapping) {
    //       result.meta[mapping.remote_id] = v;
    //     }
    //   }
    // }

    return result;
  }

  async unify(
    source: GitlabTicketOutput | GitlabTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return Promise.all(
      sourcesArray.map(async (ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: GitlabTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket[mapping.remote_id];
      }
    }

    let opts: any;
    if (ticket.type) {
      opts = { ...opts, type: ticket.type === 'opened' ? 'OPEN' : 'CLOSED' };
    }

    if (ticket.assignee) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee),
        connectionId,
      );
      if (user_id) {
        opts = { ...opts, assigned_to: [user_id] };
      }
    }

    const tags = ticket.labels;
    if (tags) {
      await this.ingestService.ingestData<UnifiedTagOutput, OriginalTagOutput>(
        tags,
        'gitlab',
        connectionId,
        'ticketing',
        'tag',
        [],
      );
    }

    if (ticket.project_id) {
      const tcg_collection_id = await this.utils.getCollectionUuidFromRemoteId(
        String(ticket.project_id),
        connectionId,
      );
      if (tcg_collection_id) {
        opts = { ...opts, collections: [tcg_collection_id] };
      }
    }

    const unifiedTicket: UnifiedTicketOutput = {
      remote_id: String(ticket.id),
      name: ticket.title,
      description: ticket.description || null,
      due_date: new Date(ticket.created_at),
      tags: tags || null,
      field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
