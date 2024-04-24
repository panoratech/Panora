import { ITicketMapper } from '@ticketing/ticket/types';
import { GithubTicketInput, GithubTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class GithubTicketMapper implements ITicketMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
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

    // Handling custom field mappings
    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find((m) => m.slug === key);
          if (mapping) {
            // TODO: Since GitHub API doesn't support arbitrary custom fields directly,
            // you might need to handle these mappings in a specific way,
            // such as appending them to the body or handling them externally.
          }
        }
      }
    }

    return result;
  }

  async unify(
    source: GithubTicketOutput | GithubTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map(async (ticket) => {
        const field_mappings = customFieldMappings?.map((mapping) => ({
          [mapping.slug]: ticket.labels.find(
            (label) => label.name === mapping.remote_id,
          )?.description,
        }));

        const opts: any = {};

        if (ticket.assignees && ticket.assignees.length > 0) {
          opts.assigned_to = [];
          for (const assignee of ticket.assignees) {
            const userUuid = await this.utils.getUserUuidFromRemoteId(
              String(assignee.id),
              'github',
            );
            if (userUuid) {
              opts.assigned_to.push(userUuid);
            }
          }
        }

        const unifiedTicket: UnifiedTicketOutput = {
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
