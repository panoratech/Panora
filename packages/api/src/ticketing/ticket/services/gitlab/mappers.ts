import { ITicketMapper } from '@ticketing/ticket/types';
import { GitlabTicketOutput, GitlabTicketInput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';

export class GitlabTicketMapper implements ITicketMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  getIssueType(type?: string, isUnify?: boolean): string {
    if (!isUnify) {
      if (!type) {
        return 'issue';
      }
      if (type === 'problem') {
        return 'incident';
      }
      return 'issue';
    }

    type = type?.toLowerCase();
    if (type === 'incident') {
      return 'PROBLEM';
    }

    if (['test_case', 'task'].includes(type)) {
      return 'TASK';
    }
    return 'TASK';
  }

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<GitlabTicketInput> {
    try {
      if (!source.project_id) {
        // we are getting remote_id from the user.
        throw new Error('For gitlab provider, project_id is mandatory!');
      }
      const projectRemoteId = await this.utils.getCollectionRemoteIdFromUuid(
        source.project_id,
      );

      const result: GitlabTicketInput = {
        id: parseInt(projectRemoteId),
        title: source.name ?? '',
        description: source.description ?? '',
        issue_type: this.getIssueType(source.type?.toLowerCase()),
      };

      // Assuming that 'assigned_to' contains user UUIDs that need to be converted to GitHub usernames
      if (source.assigned_to && source.assigned_to.length > 0) {
        const assingesTo = await this.utils.getAssigneeFromUuids(
          source.assigned_to,
        );
        const remoteIds = assingesTo.map((user) => Number(user.remote_id));
        if (assingesTo.length) {
          result.assignee_ids = remoteIds;
          result.assignee_id = remoteIds[0];
        }
      }

      if (source.due_date) {
        result.due_date = new Date(source.due_date).toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          },
        );
      }
      if (source.tags) {
        result.labels = (source.tags || []).join(',');
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async unify(
    source: GitlabTicketOutput | GitlabTicketOutput[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    try {
      const sourcesArray = Array.isArray(source) ? source : [source];
      return Promise.all(
        sourcesArray.map(async (ticket) => {
          const field_mappings: { [key: string]: any } = {};

          let opts: any = {};

          if (ticket.assignees && ticket.assignees.length > 0) {
            opts.assigned_to = await this.utils.getUsersUUidFromRemoteIds(
              ticket.assignees.map((user) => `${user.id ?? ''}`),
              'gitlab',
            );
          }

          if (ticket.project_id) {
            const tcg_collection_id =
              await this.utils.getCollectionUuidFromRemoteId(
                String(ticket.project_id),
                'gitlab',
              );
            if (tcg_collection_id) {
              opts = { ...opts, project_id: tcg_collection_id };
            }
          }

          if (ticket.closed_at) {
            opts.completed_at = new Date(ticket.closed_at).toISOString();
          }
          if (ticket.due_date) {
            opts.due_date = new Date(ticket.due_date).toISOString();
          }
          const unifiedTicket: UnifiedTicketOutput = {
            remote_id: String(ticket.id),
            name: ticket.title,
            description: ticket.description ?? '',
            status: ticket.state,
            tags: ticket.labels || [],
            type: this.getIssueType(ticket.issue_type?.toLowerCase(), true),
            state: ticket.state?.toUpperCase() ?? '',
            priority: ticket.severity,
            field_mappings: field_mappings,
            ...opts,
          };
          return unifiedTicket;
        }),
      );
    } catch (err) {
      throw err;
    }
  }
}
