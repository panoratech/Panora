import { ITicketMapper } from '@ticketing/ticket/types';
import { FrontTicketInput, FrontTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/ticket/utils';

export class FrontTicketMapper implements ITicketMapper {
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
  ): Promise<FrontTicketInput> {
    let result: FrontTicketInput = {
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

    if (source.assigned_to && source.assigned_to.length > 0) {
      const res: string[] = [];
      for (const assignee of source.assigned_to) {
        res.push(
          await this.utils.getAsigneeRemoteIdFromUserUuid(assignee, 'front'),
        );
      }
      result = {
        ...result,
        teammate_ids: res,
      };
    }

    if (source.tags) {
      result = {
        ...result,
        tags: source.tags,
      };
    }

    if (customFieldMappings && source.field_mappings) {
      for (const fieldMapping of source.field_mappings) {
        for (const key in fieldMapping) {
          const mapping = customFieldMappings.find(
            (mapping) => mapping.slug === key,
          );
          if (mapping) {
            result['custom_fields'][mapping.remote_id] = fieldMapping[key];
          }
        }
      }
    }

    return result;
  }

  async unify(
    source: FrontTicketOutput | FrontTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map((ticket) =>
        this.mapSingleTicketToUnified(ticket, customFieldMappings),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: FrontTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: ticket.custom_fields?.[mapping.remote_id],
    }));

    let opts: any;

    if (ticket.assignee) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee.id),
        'front',
      );
      if (user_id) {
        opts = { assigned_to: [user_id] };
      } else {
        throw new Error('user id not found for this ticket');
      }
    }

    const unifiedTicket: UnifiedTicketOutput = {
      name: ticket.subject,
      status: ticket.status,
      description: ticket.subject, // todo: ?
      due_date: new Date(ticket.created_at), // todo ?
      tags: ticket.tags?.map((tag) => tag.name),
      field_mappings: field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
