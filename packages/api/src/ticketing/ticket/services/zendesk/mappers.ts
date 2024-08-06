import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { CoreUnification } from '@@core/@core-services/unification/core-unification.service';
import { IngestDataService } from '@@core/@core-services/unification/ingest-data.service';
import { UnifiedTicketingTagOutput } from '@ticketing/tag/types/model.unified';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ZendeskTagOutput } from '@ticketing/tag/services/zendesk/types';
import { ITicketMapper } from '@ticketing/ticket/types';
import {
  TicketPriority,
  TicketStatus,
  TicketType,
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { CustomField, ZendeskTicketInput, ZendeskTicketOutput } from './types';

@Injectable()
export class ZendeskTicketMapper implements ITicketMapper {
  constructor(
    private mappersRegistry: MappersRegistry,
    private utils: Utils,
    private ingestService: IngestDataService,
    private coreUnificationService: CoreUnification,
  ) {
    this.mappersRegistry.registerService(
      'ticketing',
      'ticket',
      'zendesk',
      this,
    );
  }

  mapToTicketPriority(
    data: 'urgent' | 'high' | 'normal' | 'low',
  ): TicketPriority {
    switch (data) {
      case 'low':
        return 'LOW';
      case 'normal':
        return 'MEDIUM';
      case 'high':
        return 'HIGH';
      case 'urgent':
        return 'HIGH';
    }
  }
  reverseMapToTicketPriority(data: TicketPriority): string {
    switch (data) {
      case 'LOW':
        return 'low';
      case 'MEDIUM':
        return 'normal';
      case 'HIGH':
        return 'high';
    }
  }

  reverseMapToTicketType(data: TicketType) {
    switch (data) {
      case 'BUG':
        return 'problem';
      case 'SUBTASK':
        return 'task';
      case 'TASK':
        return 'task';
      case 'TO-DO':
        return 'task';
    }
  }
  mapToIssueTypeName(
    data: 'problem' | 'incident' | 'question' | 'task',
  ): TicketType | string {
    switch (data) {
      case 'problem':
        return 'BUG';
      case 'incident':
        return 'BUG';
      case 'task':
        return 'TASK';
      default:
        return data;
    }
  }

  mapToTicketStatus(
    data: 'new' | 'open' | 'pending' | 'hold' | 'solved' | 'closed',
  ): TicketStatus | string {
    switch (data) {
      case 'new':
        return 'OPEN';
      case 'open':
        return 'OPEN';
      case 'solved':
        return 'CLOSED';
      case 'closed':
        return 'CLOSED';
      default:
        return data;
    }
  }

  async desunify(
    source: UnifiedTicketingTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskTicketInput> {
    const result: ZendeskTicketInput = {
      description: source.description,
      subject: source.name,
      comment: {
        body: source.comment.body || null,
        public: !source.comment.is_private || true,
        uploads: (source.attachments as string[]) ?? [], //fetch token attachments for this uuid, would be done on the fly in dest service
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
      result.due_at = source.due_date as any; //todo
    }
    if (source.priority) {
      result.priority = this.reverseMapToTicketPriority(
        source.priority as TicketPriority,
      );
    }
    if (source.status) {
      result.status = source.status.toLowerCase() as 'open' | 'closed';
    }
    if (source.tags) {
      result.tags = source.tags as string[];
    }
    if (source.type) {
      result.type = this.reverseMapToTicketType(source.type as TicketType);
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleTicketToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((ticket) =>
        this.mapSingleTicketToUnified(
          ticket,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleTicketToUnified(
    ticket: ZendeskTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<Promise<UnifiedTicketingTicketOutput>> {
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

    const opts: any = {};

    //TODO: contact or user ?
    if (ticket.assignee_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        String(ticket.assignee_id),
        connectionId,
      );
      if (user_id) {
        opts.assigned_to = [user_id];
      }
    }
    if (ticket.type) {
      opts.type = this.mapToIssueTypeName(ticket.type as any) as string;
    }

    if (ticket.status) {
      opts.status = this.mapToTicketStatus(ticket.status as any) as string;
    }

    if (ticket.priority) {
      opts.priority = this.mapToTicketPriority(
        ticket.priority as any,
      ) as string;
    }

    if (ticket.tags) {
      const tags = await this.ingestService.ingestData<
        UnifiedTicketingTagOutput,
        ZendeskTagOutput
      >(
        ticket.tags.map(
          (label) =>
            ({
              name: label,
            } as ZendeskTagOutput),
        ),
        'zendesk',
        connectionId,
        'ticketing',
        TicketingObject.tag,
        [],
      );
      opts.tags = tags.map((tag) => tag.id_tcg_tag);
    }

    const unifiedTicket: UnifiedTicketingTicketOutput = {
      remote_id: String(ticket.id),
      name: ticket.subject,
      description: ticket.description,
      due_date: ticket.due_at ? new Date(ticket.due_at) : undefined,
      parent_ticket: null,
      completed_at: new Date(ticket.updated_at),
      field_mappings: field_mappings,
      ...opts,
    };

    return unifiedTicket;
  }
}
