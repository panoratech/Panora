import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
// The following line is commented because it uses code from the ATS Module, which was removed from the project
//import { OriginalTagOutput } from '@@core/utils/types/original/original.ats';
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
import { FrontTicketInput, FrontTicketOutput } from './types';

@Injectable()
export class FrontTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService('ticketing', 'ticket', 'front', this);
  }

  mapToTicketStatus(
    data: 'assigned' | 'archived' | 'unassigned' | 'deleted',
  ): TicketStatus | string {
    switch (data) {
      case 'assigned':
        return 'OPEN';
      case 'archived':
        return 'CLOSED';
      case 'unassigned':
        return 'unassigned';
      case 'deleted':
        return 'CLOSED';
    }
  }

  async desunify(
    source: UnifiedTicketingTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    connection_id?: string,
  ): Promise<FrontTicketInput> {
    const body_: any = {};

    if (source.comment.creator_type === 'USER') {
      body_.author_id = await this.utils.getAsigneeRemoteIdFromUserUuid(
        source.comment.user_id,
      );
    }
    if (source.attachments) {
      body_.attachments = source.attachments as string[];
    }
    const result: FrontTicketInput = {
      type: 'discussion',
      subject: source.name,
      comment: {
        body: source.comment.body,
        ...body_,
      },
    };

    if (source.assigned_to && source.assigned_to.length > 0) {
      const res: string[] = [];
      for (const assignee of source.assigned_to) {
        const data = await this.utils.getAsigneeRemoteIdFromUserUuid(assignee);
        if (data) {
          res.push(data);
        }
      }
      result.teammate_ids = res;
    }

    if (source.tags) {
      result.tags = [];
      for (const tag of source.tags) {
        const id = await this.utils.getRemoteIdFromTagName(
          tag as string,
          connection_id,
        );
        result.tags.push(id);
      }
    }

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
    source: FrontTicketOutput | FrontTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map((ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: FrontTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.custom_fields[mapping.remote_id];
      }
    }

    let opts: any = {};

    if (ticket.assignee) {
      //fetch the right assignee uuid from remote id
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee.id),
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
          assigned_to: [user_id],
        };
      }
    }
    // The following code is commented because it uses code from the ATS Module, which was removed from the project

    // if (ticket.tags) {
    //   const tags = (await this.coreUnificationService.unify<
    //     OriginalTagOutput[]
    //   >({
    //     sourceObject: ticket.tags,
    //     targetType: TicketingObject.tag,
    //     providerName: 'front',
    //     vertical: 'ticketing',
    //     connectionId: connectionId,
    //     customFieldMappings: [],
    //   })) as UnifiedTicketingTagOutput[];
    //   opts = {
    //     ...opts,
    //     tags: tags,
    //   };
    // }
    const unifiedTicket: UnifiedTicketingTicketOutput = {
      remote_id: ticket.id,
      remote_data: ticket,
      name: ticket.subject,
      status: this.mapToTicketStatus(ticket.status as any),
      description: ticket.subject,
      due_date: null,
      field_mappings: field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
