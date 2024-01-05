import { ITicketMapper } from '@ticketing/ticket/types';
import { FrontTicketInput, FrontTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class FrontTicketMapper implements ITicketMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<FrontTicketInput> {
    const result: FrontTicketInput = {
      type: 'discussion', // Assuming 'discussion' as a default type for Front conversations
      subject: source.name,
      teammate_ids: source.assigned_to,
      comment: {
        body: source.comment.body,
        author_id:
          source.comment.creator_type === 'user'
            ? source.comment.user_id
            : source.comment.contact_id,
        attachments: source.comment.attachments,
      },
    };

    //TODO: custom fields => https://dev.frontapp.com/reference/patch_conversations-conversation-id
    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result[mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }

    return result;
  }

  unify(
    source: FrontTicketOutput | FrontTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput | UnifiedTicketOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((ticket) =>
      this.mapSingleTicketToUnified(ticket, customFieldMappings),
    );
  }

  private mapSingleTicketToUnified(
    ticket: FrontTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput {
    const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: ticket.custom_fields?.[mapping.remote_id],
    }));

    const unifiedTicket: UnifiedTicketOutput = {
      id: ticket.id,
      name: ticket.subject,
      status: ticket.status,
      description: ticket.subject, // todo: ?
      due_date: new Date(ticket.created_at), // todo ?
      tags: JSON.stringify(ticket.tags?.map((tag) => tag.name)),
      assigned_to: ticket.assignee ? [ticket.assignee.email] : undefined, //TODO: it must be a uuid of a user object
      field_mappings: field_mappings,
    };

    return unifiedTicket;
  }
}
