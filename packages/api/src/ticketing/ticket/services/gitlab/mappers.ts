import { ITicketMapper } from '@ticketing/ticket/types';
<<<<<<< HEAD
import { GitlabTicketOutput, GitlabTicketInput } from './types';
import {
    UnifiedTicketInput,
    UnifiedTicketOutput,
=======
import { GitlabTicketInput, GitlabTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
>>>>>>> gitlab-connector-with-pagination-feat
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';

export class GitlabTicketMapper implements ITicketMapper {
<<<<<<< HEAD
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
    ): Promise<GitlabTicketInput> {

        // TODO - Project_id should be mandatory field for gitlab provider

        const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(source.project_id);




        const result: GitlabTicketInput = {
            title: source.name,
            description: source.description ? source.description : '',
            project_id: Number(remote_project_id)
        };

        if (source.status) {
            result.type = source.status === "OPEN" ? "opened" : "closed";
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
            result.labels = source.tags ? source.tags : []
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
        customFieldMappings?: {
            slug: string;
            remote_id: string;
        }[],
    ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
        const sourcesArray = Array.isArray(source) ? source : [source];
        return Promise.all(
            sourcesArray.map(async (ticket) =>
                this.mapSingleTicketToUnified(ticket, customFieldMappings),
            ),
        );
    }

    private async mapSingleTicketToUnified(
        ticket: GitlabTicketOutput,
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
            opts = { ...opts, type: ticket.type === "opened" ? "OPEN" : "CLOSED" }
        }

        if (ticket.assignee) {
            //fetch the right assignee uuid from remote id
            const user_id = await this.utils.getUserUuidFromRemoteId(
                String(ticket.assignee),
                'gitlab',
            );
            if (user_id) {
                opts = { ...opts, assigned_to: [user_id] };
            }
        }

        if (ticket.project_id) {
            const tcg_collection_id = await this.utils.getCollectionUuidFromRemoteId(
                String(ticket.project_id),
                'gitlab'
            );
            if (tcg_collection_id) {
                opts = { ...opts, project_id: tcg_collection_id }
            }
        }



        const unifiedTicket: UnifiedTicketOutput = {
            remote_id: String(ticket.id),
            name: ticket.title,
            description: ticket.description ? ticket.description : '',
            due_date: new Date(ticket.created_at),
            tags: ticket.labels ? ticket.labels : [],
            field_mappings,
            ...opts

        }

        return unifiedTicket;


    }
=======
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
      const assingesTo = await this.utils.getAssigneFromUuids(
        source.assigned_to,
      );
      const remoteIds = assingesTo.map((user) => Number(user.remote_id));
      if (assingesTo.length) {
        result.assignee_ids = remoteIds;
        result.assignee_id = remoteIds[0];
      }
    }

    if (source.due_date) {
      result.due_date = new Date(source.due_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
    if (source.tags) {
      result.labels = (source.tags || []).join(',');
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
    source: GitlabTicketOutput | GitlabTicketOutput[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
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
  }
>>>>>>> gitlab-connector-with-pagination-feat
}
