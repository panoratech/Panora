import { ITicketMapper } from '@ticketing/ticket/types';
import { dixaTicketInput, dixaTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { Utils } from '@ticketing/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class dixaTicketMapper implements ITicketMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'dixa', this);
  }
  async desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<dixaTicketInput> {
    const body_: any = {};

    if (source.comment.creator_type === 'user') {
      body_.author_id = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.comment.user_id,
      );
    }
    if (source.comment.attachments) {
      body_.attachments = source.comment.attachments;
    }
    const result: dixaTicketInput = {
      _type: 'discussion',
      subject: source.name,
      message: {
        body: source.comment.body,
        ...body_,
      },
    };

    // if (source.assigned_to && source.assigned_to.length > 0) {
    //   const res: string[] = [];
    //   for (const assignee of source.assigned_to) {
    //     const data = await this.utils.getAsigneeRemoteIdFromUserUuid(assignee);
    //     if (data) {
    //       res.push(data);
    //     }
    //   }
    //   result.teammate_ids = res;
    // }

    // if (source.tags) {
    //   result.tags = source.tags;
    // }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: dixaTicketOutput | dixaTicketOutput[],
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
    ticket: dixaTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.id[mapping.remote_id];
      }
    }

    let opts: any;

    if (ticket.assignment.agentId) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignment.agentId),
        'dixa',
      );
      if (user_id) {
        opts = { assigned_to: [user_id] };
      }
    }

    const unifiedTicket: UnifiedTicketOutput = {
      remote_id: ticket.id,
      name: ticket.customAttributes[0].name,
      status: ticket.state,
      description: ticket.customAttributes[0].value, // todo: ?
      due_date: new Date(ticket.stateUpdatedAt), // todo ?
      //   tags: ticket.tags?.map((tag) => tag.name),
      field_mappings: field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
