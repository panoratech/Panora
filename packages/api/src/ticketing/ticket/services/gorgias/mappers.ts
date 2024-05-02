import { ITicketMapper } from '@ticketing/ticket/types';
import { GorgiasTicketInput, GorgiasTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';

export class GorgiasTicketMapper implements ITicketMapper {
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
  ): Promise<GorgiasTicketInput> {
    const result: GorgiasTicketInput = {
      channel: source.type ?? 'email', // Assuming 'email' as default channel
      subject: source.name,
      created_datetime:
        source.due_date?.toISOString() || new Date().toISOString(),
      messages: [
        {
          via: source.type ?? 'email',
          from_agent: false,
          channel: source.type ?? 'email',
          body_html: source.comment.html_body || '',
          body_text: source.comment.body || '',
          attachments: source.comment.attachments
            ? source.comment.attachments.map((att) => ({
                extra: att,
              }))
            : [],
          sender:
            source.comment.creator_type === 'user'
              ? {
                  id: Number(
                    await this.utils.getAsigneeRemoteIdFromUserUuid(
                      source.comment.user_id,
                    ),
                  ),
                }
              : null,
        },
      ],
    };

    if (source.status) {
      result.status = source.status.toLowerCase();
    }

    if (source.assigned_to && source.assigned_to.length > 0) {
      const data = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.assigned_to[0],
      );
      result.assignee_user = {
        id: Number(data),
      };
    }

    if (source.tags) {
      result.tags = source.tags.map((tag) => ({ name: tag }));
    }

    if (customFieldMappings && source.field_mappings) {
      result.meta = {}; // Ensure meta exists
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result.meta[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: GorgiasTicketOutput | GorgiasTicketOutput[],
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
    ticket: GorgiasTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.meta[mapping.remote_id];
      }
    }

    let opts: any;

    if (ticket.assignee_user) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee_user.id),
        'gorgias',
      );
      if (user_id) {
        opts = { assigned_to: [user_id] };
      }
    }

    // Assuming additional processing is needed to fully populate the UnifiedTicketOutput
    const unifiedTicket: UnifiedTicketOutput = {
      name: ticket.subject,
      status: ticket.status,
      description: ticket.subject, // Assuming the description is similar to the subject
      field_mappings,
      due_date: new Date(ticket.created_datetime),
      tags: ticket.tags?.map((tag) => tag.name),
      ...opts,
    };

    return unifiedTicket;
  }
}
