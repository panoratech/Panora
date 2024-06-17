import { ITicketMapper } from '@ticketing/ticket/types';
import { CustomField, ZendeskTicketInput, ZendeskTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskTicketMapper implements ITicketMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'ticket',
      'zendesk',
      this,
    );
  }

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskTicketInput> {
    const result: ZendeskTicketInput = {
      description: source.description,
      subject: source.name,
      comment: {
        body: source.comment.body || '',
        public: !source.comment.is_private || true,
        uploads: source.comment.attachments || [], //fetch token attachments for this uuid, would be done on the fly in dest service
      },
    };
    if (source.comment.html_body) {
      result.comment.html_body = source.comment.html_body;
    }
    if (source.assigned_to && source.assigned_to.length > 0) {
      result.assignee_email = await this.utils.getAssigneeMetadataFromUuid(
        source.assigned_to?.[0],
      ); // get the mail of the uuid
    }
    if (source.due_date) {
      result.due_at = source.due_date?.toISOString();
    }
    if (source.priority) {
      result.priority = (
        source.priority == 'MEDIUM' ? 'normal' : source.priority.toLowerCase()
      ) as 'urgent' | 'high' | 'normal' | 'low';
    }
    if (source.status) {
      result.status = source.status.toLowerCase() as 'open' | 'closed';
    }
    if (source.tags) {
      result.tags = source.tags;
    }
    if (source.type) {
      result.type = source.type.toLowerCase() as
        | 'problem'
        | 'incident'
        | 'question'
        | 'task';
    }

    if (customFieldMappings && source.field_mappings) {
      let res: CustomField[] = [];
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          const obj = { id: mapping.remote_id, value: v };
          res = [...res, obj];
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
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        const customField = ticket.custom_fields.find(
          (field) => field.id === mapping.remote_id,
        );
        if (customField) {
          field_mappings[mapping.slug] = customField.value;
        }
      }
    }

    let opts: any;

    //TODO: contact or user ?
    if (ticket.assignee_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee_id),
        'zendesk',
      );
      if (user_id) {
        opts = { assigned_to: [user_id] };
      }
    }
    if (ticket.type) {
      opts = {
        type:
          ticket.type === 'incident' ? 'PROBLEM' : ticket.type.toUpperCase(),
      };
    }

    const unifiedTicket: UnifiedTicketOutput = {
      remote_id: String(ticket.id),
      name: ticket.subject,
      status:
        ticket.status === 'new' || ticket.status === 'open' ? 'OPEN' : 'CLOSED', // todo: handle pending status ?
      description: ticket.description,
      due_date: ticket.due_at ? new Date(ticket.due_at) : undefined,
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
