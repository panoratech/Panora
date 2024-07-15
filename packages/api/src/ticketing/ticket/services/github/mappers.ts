import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
  TicketStatus,
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { GithubTicketInput, GithubTicketOutput } from './types';

@Injectable()
export class GithubTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'github', this);
  }

  mapToTicketStatus(data: 'open' | 'closed'): TicketStatus {
    switch (data) {
      case 'open':
        return 'OPEN';
      case 'closed':
        return 'CLOSED';
    }
  }

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GithubTicketInput> {
    const result: GithubTicketInput = {
      title: source.name,
      body: source.description,
      assignees: [],
      labels: (source.tags as string[]) || [],
    };

    // Assuming that 'assigned_to' contains user UUIDs that need to be converted to GitHub usernames
    if (source.assigned_to && source.assigned_to.length > 0) {
      for (const assigneeUuid of source.assigned_to) {
        const email = await this.utils.getAssigneeMetadataFromUuid(
          assigneeUuid,
        );
        if (email) {
          result.assignees.push(email);
        }
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
          // TODO: Since GitHub API doesn't support arbitrary custom fields directly,
          // you might need to handle these mappings in a specific way,
          // such as appending them to the body or handling them externally.
        }
      }
    }

    return result;
  }

  async unify(
    source: GithubTicketOutput | GithubTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map(async (ticket) => {
        const field_mappings: { [key: string]: any } = {};
        if (customFieldMappings) {
          for (const mapping of customFieldMappings) {
            field_mappings[mapping.slug] = ticket.labels.find(
              (label) => label.name === mapping.remote_id,
            )?.description;
          }
        }

        const opts: any = {};

        if (ticket.assignees && ticket.assignees.length > 0) {
          opts.assigned_to = [];
          for (const assignee of ticket.assignees) {
            const userUuid = await this.utils.getUserUuidFromRemoteId(
              String(assignee.id),
              connectionId,
            );
            if (userUuid) {
              opts.assigned_to.push(userUuid);
            }
          }
        }

        /*TODO: first implement github tags 
        if (ticket.labels) {
          const tags = (await this.coreUnificationService.unify<
            OriginalTagOutput[]
          >({
            sourceObject: ticket.labels,
            targetType: TicketingObject.tag,
            providerName: 'github',
            vertical: 'ticketing',
            connectionId: connectionId,
            customFieldMappings: [],
          })) as UnifiedTagOutput[];
          opts.tags = tags;
        }*/

        const unifiedTicket: UnifiedTicketOutput = {
          remote_id: String(ticket.id),
          remote_data: ticket,
          name: ticket.title,
          description: ticket.body,
          status: this.mapToTicketStatus(ticket.state as any),
          field_mappings: field_mappings,
          ...opts,
        };

        return unifiedTicket;
      }),
    );
  }
}
