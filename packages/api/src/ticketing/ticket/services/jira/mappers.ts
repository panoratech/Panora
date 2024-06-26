import { ITicketMapper } from '@ticketing/ticket/types';
import { JiraTicketInput, JiraTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JiraTicketMapper implements ITicketMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'jira', this);
  }

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<JiraTicketInput> {
    if (!source.project_id) {
      throw new ReferenceError(
        'a project key/id is mandatory for Jira ticket creation',
      );
    }
    const result: JiraTicketInput = {
      fields: {
        project: {
          key: source.project_id || null,
        },
        description: source.description,
        issuetype: {
          name: source.type || null,
        },
      },
    };

    if (source.assigned_to && source.assigned_to.length > 0) {
      const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.assigned_to[0],
      );
      result.fields.assignee = {
        id: data,
      };
    }

    if (source.tags) {
      result.fields.labels = source.tags;
    }

    // Map custom fields if applicable
    /*TODO if (customFieldMappings && source.field_mappings) {
      result.meta = {}; // Ensure meta exists
      source.field_mappings.forEach((fieldMapping) => {
        customFieldMappings.forEach((mapping) => {
          if (fieldMapping.hasOwnProperty(mapping.slug)) {
            result.meta[mapping.remote_id] = fieldMapping[mapping.slug];
          }
        });
      });
    }*/

    return result;
  }

  async unify(
    source: JiraTicketOutput | JiraTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map((ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: JiraTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    /*TODO: const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: ticket.custom_fields?.[mapping.remote_id],
    }));*/

    let opts: any;

    const assigneeId = ticket.fields.assignee.id;
    const user_id = await this.utils.getUserUuidFromRemoteId(
      assigneeId,
      connectionId,
    );
    if (user_id) {
      opts = { assigned_to: [user_id] };
    }

    const unifiedTicket: UnifiedTicketOutput = {
      remote_id: ticket.id,
      name: ticket.fields.description,
      status: ticket.fields.status.name,
      description: ticket.fields.description,
      due_date: new Date(ticket.fields.duedate),
      tags: ticket.fields.labels,
      field_mappings: [], //TODO
      ...opts,
    };

    return unifiedTicket;
  }
}
