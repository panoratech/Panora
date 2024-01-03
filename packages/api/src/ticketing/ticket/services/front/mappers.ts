import { ITicketMapper } from '@ticketing/ticket/types';
import { FrontTicketInput, FrontTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export class FrontTicketMapper implements ITicketMapper {
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontTicketInput {
    // For simplicity, we're assuming that the attachments are provided as string URLs.
    // In a real implementation, we would need to handle binary data for attachments.
    //TODO: handle attachments
    /*const attachments = source.comments?.[0]?.attachments?.map(
      (attachment) => attachment.url,
    );*/

    const result: FrontTicketInput = {
      type: 'discussion', // Assuming 'discussion' as a default type for Front conversations
      subject: source.name,
      inbox_id: source.assigned_to?.[0], // TODO
      comment: {
        body: source.comment.body,
        author_id: source.comment.contact_id || source.comment.user_id,
      },
    };

    //TODO: custom fields => https://dev.frontapp.com/reference/patch_conversations-conversation-id

    // Custom fields mapping logic
    /*if (customFieldMappings && source.field_mappings) {
      result.custom_fields = {};
      customFieldMappings.forEach((mapping) => {
        const fieldMapping = source.field_mappings?.find(
          (fm) => fm[mapping.slug],
        );
        if (fieldMapping && fieldMapping[mapping.slug]) {
          result.custom_fields[mapping.remote_id] = fieldMapping[mapping.slug];
        }
      });
    }*/

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
      assigned_to: ticket.assignee ? [ticket.assignee.email] : undefined,
      field_mappings: field_mappings,
    };

    return unifiedTicket;
  }
}
