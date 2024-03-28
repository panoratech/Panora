import { ITicketMapper } from '@ticketing/ticket/types';
import { CustomField, ZendeskTicketInput, ZendeskTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class ZendeskTicketMapper implements ITicketMapper {
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
  ): Promise<ZendeskTicketInput> {
    let result: ZendeskTicketInput = {
      description: source.description,
      priority: 'high',
      status: 'new',
      subject: source.name,
      comment: {
        body: source.comment.body,
        html_body: source.comment.html_body || null,
        public: !source.comment.is_private || true,
        uploads: source.comment.attachments, //fetch token attachments for this uuid, would be done on the fly in dest service
      },
    };
    if (source.assigned_to && source.assigned_to.length > 0) {
      result = {
        ...result,
        assignee_email: await this.utils.getAssigneeMetadataFromUuid(
          source.assigned_to?.[0],
        ), // get the mail of the uuid
      };
    }
    if (source.due_date) {
      result = {
        ...result,
        due_at: source.due_date?.toISOString(),
      };
    }
    if (source.priority) {
      result = {
        ...result,
        priority: source.priority as 'urgent' | 'high' | 'normal' | 'low',
      };
    }
    if (source.status) {
      result = {
        ...result,
        status: source.status as
          | 'new'
          | 'open'
          | 'pending'
          | 'hold'
          | 'solved'
          | 'closed',
      };
    }
    if (source.tags) {
      result = {
        ...result,
        tags: source.tags,
      };
    }
    if (source.type) {
      result = {
        ...result,
        type: source.type as 'problem' | 'incident' | 'question' | 'task',
      };
    }

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

  async unify(
    source: ZendeskTicketOutput | ZendeskTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleTicketToUnified(source, customFieldMappings);
    }
    return Promise.all(
      source.map((ticket) =>
        this.mapSingleTicketToUnified(ticket, customFieldMappings),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: ZendeskTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<Promise<UnifiedTicketOutput>> {
    const field_mappings = customFieldMappings.reduce((acc, mapping) => {
      const customField = ticket.custom_fields.find(
        (field) => field.id === mapping.remote_id,
      );
      if (customField) {
        acc.push({ [mapping.slug]: customField.value });
      }
      return acc;
    }, [] as Record<string, any>[]);
    let opts: any;

    //TODO: contact or user ?
    if (ticket.assignee_id) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee_id),
        'zendesk_tcg',
      );
      if (user_id) {
        opts = { assigned_to: [user_id] };
      }
    }

    const unifiedTicket: UnifiedTicketOutput = {
      remote_id: ticket.id,
      name: ticket.subject,
      status: ticket.status,
      description: ticket.description,
      due_date: ticket.due_at ? new Date(ticket.due_at) : undefined,
      type: ticket.type,
      parent_ticket: undefined, // If available, add logic to map parent ticket
      tags: ticket.tags,
      completed_at: new Date(ticket.updated_at),
      priority: ticket.priority,
      field_mappings: field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
