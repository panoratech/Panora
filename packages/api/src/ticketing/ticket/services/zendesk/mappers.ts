import { ITicketMapper } from '@ticketing/ticket/types';
import { CustomField, ZendeskTicketInput, ZendeskTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export class ZendeskTicketMapper implements ITicketMapper {
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskTicketInput {
    const result: ZendeskTicketInput = {
      assignee_email: source.assigned_to?.[0], // Assuming the first assigned_to is the assignee email
      created_at: source.completed_at?.toISOString(),
      custom_fields: undefined, // Custom field mapping logic needed TODO
      description: source.description,
      due_at: source.due_date?.toISOString(),
      priority: source.priority as 'urgent' | 'high' | 'normal' | 'low',
      status: source.status as
        | 'new'
        | 'open'
        | 'pending'
        | 'hold'
        | 'solved'
        | 'closed',
      subject: source.name,
      tags: [source.tags],
      type: source.type as 'problem' | 'incident' | 'question' | 'task',
      updated_at: source.completed_at?.toISOString(),
      comment: {
        body: source.comment.body,
        html_body: source.comment.html_body,
        public: !source.comment.is_private,
      },
    };

    if (customFieldMappings && source.field_mappings) {
      let res: CustomField[] = [];
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            const obj = { id: mapping.remote_id, value: fieldMapping[key] }; //TODO
            //result[custom_fields][mapping.remote_id] = fieldMapping[key];
            res = [...res, obj];
          }
        }
      }
      result['custom_fields'] = res;
    }
    return result;
  }

  unify(
    source: ZendeskTicketOutput | ZendeskTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput | UnifiedTicketOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleTicketToUnified(source, customFieldMappings);
    }
    return source.map((ticket) =>
      this.mapSingleTicketToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTicketToUnified(
    ticket: ZendeskTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput {
    /*TODO const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: ticket.custom_fields[mapping.remote_id],
    }));*/

    const unifiedTicket: UnifiedTicketOutput = {
      name: ticket.subject,
      status: ticket.status,
      description: ticket.description,
      due_date: ticket.due_at ? new Date(ticket.due_at) : undefined,
      type: ticket.type,
      parent_ticket: undefined, // If available, add logic to map parent ticket
      tags: JSON.stringify(ticket.tags), //TODO
      completed_at: undefined, // If available, add logic to determine the completed date
      priority: ticket.priority,
      assigned_to: undefined, // If available, add logic to map assigned users
      field_mappings: undefined, // Add logic to map custom fields if available
      id: ticket.id.toString(),
    };

    return unifiedTicket;
  }
}
