import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { OriginalTagOutput } from '@@core/utils/types/original/original.ticketing';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
  TicketStatus,
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { GorgiasTicketInput, GorgiasTicketOutput } from './types';
import { GorgiasTagOutput } from '@ticketing/tag/services/gorgias/types';

@Injectable()
export class GorgiasTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'ticket',
      'gorgias',
      this,
    );
  }

  mapToTicketStatus(data: 'open' | 'closed'): TicketStatus {
    switch (data) {
      case 'open':
        return 'OPEN';
      case 'closed':
        return 'CLOSED';
    }
  }

  async desunify(
    source: UnifiedTicketingTicketInput,
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
          body_html: source.comment.html_body || null,
          body_text: source.comment.body || null,
          attachments: (source.attachments as string[]) ?? [],
          sender:
            source.comment.creator_type === 'USER'
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
      result.tags = (source.tags as string[]).map((tag) => ({ name: tag }));
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return Promise.all(
      sourcesArray.map(async (ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: GorgiasTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.meta[mapping.remote_id];
      }
    }

    let opts: any = {};

    if (ticket.assignee_user) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee_user.id),
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
          assigned_to: [user_id],
        };
      }
    }
    if (ticket.tags) {
      const tags = (await this.coreUnificationService.unify<
        OriginalTagOutput[]
      >({
        sourceObject: ticket.tags as GorgiasTagOutput[],
        targetType: TicketingObject.tag,
        providerName: 'gorgias',
        vertical: 'ticketing',
        connectionId: connectionId,
        customFieldMappings: [],
      })) as UnifiedTicketingTagOutput[];
      opts = {
        ...opts,
        tags: tags,
      };
    }

    const unifiedTicket: UnifiedTicketingTicketOutput = {
      remote_id: String(ticket.id),
      remote_data: ticket,
      name: ticket.subject,
      status: this.mapToTicketStatus(ticket.status as any),
      description: ticket.subject,
      field_mappings,
      due_date: new Date(ticket.created_datetime),
      ...opts,
    };

    return unifiedTicket;
  }
}
