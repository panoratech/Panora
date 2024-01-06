import { ITicketMapper } from '@ticketing/ticket/types';
import { CustomField, ZendeskTicketInput, ZendeskTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class ZendeskTicketMapper implements ITicketMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskTicketInput> {
    const result: ZendeskTicketInput = {
      assignee_email: await this.utils.getAssigneeMetadataFromUuid(
        source.assigned_to?.[0],
      ), // get the mail of the uuid
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
      tags: source.tags,
      type: source.type as 'problem' | 'incident' | 'question' | 'task',
      comment: {
        body: source.comment.body,
        html_body: source.comment.html_body,
        public: !source.comment.is_private,
        uploads: source.comment.attachments, //fetch token attachments for this uuid
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
            const obj = { id: mapping.remote_id, value: fieldMapping[key] };
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
    const field_mappings = customFieldMappings.reduce((acc, mapping) => {
      const customField = ticket.custom_fields.find(
        (field) => field.id === mapping.remote_id,
      );
      if (customField) {
        acc.push({ [mapping.slug]: customField.value });
      }
      return acc;
    }, [] as Record<string, any>[]);

    const unifiedTicket: UnifiedTicketOutput = {
      name: ticket.subject,
      status: ticket.status,
      description: ticket.description,
      due_date: ticket.due_at ? new Date(ticket.due_at) : undefined,
      type: ticket.type,
      parent_ticket: undefined, // If available, add logic to map parent ticket
      tags: ticket.tags,
      completed_at: new Date(ticket.updated_at),
      priority: ticket.priority,
      assigned_to: [String(ticket.assignee_id)],
      field_mappings: field_mappings,
    };

    return unifiedTicket;
  }
}
