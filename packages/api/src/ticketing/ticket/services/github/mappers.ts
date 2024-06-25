import { ITicketMapper } from '@ticketing/ticket/types';
import { GithubTicketInput, GithubTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubTicketMapper implements ITicketMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'github', this);
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
      labels: source.tags || [],
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

        const unifiedTicket: UnifiedTicketOutput = {
          remote_id: String(ticket.id),
          name: ticket.title,
          description: ticket.body,
          status: ticket.state,
          tags: ticket.labels.map((label) => label.name),
          field_mappings: field_mappings,
          ...opts,
        };

        return unifiedTicket;
      }),
    );
  }
}
