import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { GitlabTicketInput, GitlabTicketOutput } from './types';
import { GitlabTagOutput } from '@ticketing/tag/services/gitlab/types';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedTicketingCommentOutput } from '@ticketing/comment/types/model.unified';
import { GitlabCommentInput } from '@ticketing/comment/services/gitlab/types';

@Injectable()
export class GitlabTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
    private ingestService: IngestDataService,
  ) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'gitlab', this);
  }

  async desunify(
    source: UnifiedTicketingTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    connectionId?: string,
  ): Promise<GitlabTicketInput> {
    const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(
      source.collections[0] as string,
    );

    const result: GitlabTicketInput = {
      title: source.name,
      description: source.description ? source.description : null,
      project_id: Number(remote_project_id),
    };
    if (source.due_date) {
      result.due_date = source.due_date;
    }
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
    const tags = source.tags as string[];
    if (tags) {
      result.labels = tags;
    }

    if (source.comment) {
      const comment =
        (await this.coreUnificationService.desunify<UnifiedTicketingCommentOutput>({
          sourceObject: source.comment,
          targetType: TicketingObject.comment,
          providerName: 'gitlab',
          vertical: 'ticketing',
          connectionId: connectionId,
          customFieldMappings: [],
        })) as GitlabCommentInput;
      result.comment = comment;
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
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
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
  ): Promise<UnifiedTicketingTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (ticket.type) {
      opts = { ...opts, type: ticket.type === 'opened' ? 'OPEN' : 'CLOSED' };
    }

    if (ticket.assignee && ticket.assignee[0]) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee[0].id),
        connectionId,
      );
      if (user_id) {
        opts = { ...opts, assigned_to: [user_id] };
      }
    }

    if (ticket.labels) {
      const tags = await this.ingestService.ingestData<
        UnifiedTicketingTagOutput,
        GitlabTagOutput
      >(
        ticket.labels.map(
          (label) =>
            ({
              name: label,
            } as GitlabTagOutput),
        ),
        'gitlab',
        connectionId,
        'ticketing',
        TicketingObject.tag,
        [],
      );
      opts = {
        ...opts,
        tags: tags.map((tag) => tag.id_tcg_tag),
      };
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

    const unifiedTicket: UnifiedTicketingTicketOutput = {
      remote_id: String(ticket.id),
      remote_data: ticket,
      name: ticket.title,
      description: ticket.description || null,
      due_date: new Date(ticket.due_date),
      field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
