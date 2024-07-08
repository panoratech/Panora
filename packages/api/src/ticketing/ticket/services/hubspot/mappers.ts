import { ITicketMapper } from '@ticketing/ticket/types';
import { HubspotTicketInput, HubspotTicketOutput } from './types';
import {
  TicketPriority,
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class HubspotTicketMapper implements ITicketMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService(
      'ticketing',
      'ticket',
      'hubspot',
      this,
    );
  }

  mapToTicketPriority(
    data: 'low' | 'medium' | 'high priority',
  ): TicketPriority {
    switch (data) {
      case 'low':
        return 'LOW';
      case 'medium':
        return 'MEDIUM';
      case 'high priority':
        return 'HIGH';
    }
  }
  reverseMapToTicketPriority(data: TicketPriority): string {
    switch (data) {
      case 'LOW':
        return 'low';
      case 'MEDIUM':
        return 'medium';
      case 'HIGH':
        return 'high priority';
    }
  }

  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotTicketInput {
    const result: any = {
      subject: source.name,
      hs_pipeline: null,
      hubspot_owner_id: null,
      hs_pipeline_stage: null,
    };
    if (source.priority) {
      result.hs_ticket_priority = this.reverseMapToTicketPriority(
        source.priority as TicketPriority,
      );
    }
    if (customFieldMappings && source.field_mappings) {
      for (const key in source.field_mappings) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === key,
        );
        if (mapping) {
          result[mapping.remote_id] = source.field_mappings[key];
        }
      }
    }

    return result;
  }

  async unify(
    source: HubspotTicketOutput | HubspotTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]> {
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
    ticket: HubspotTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.properties[mapping.remote_id];
      }
    }
    const owner_id = ticket.properties.hubspot_owner_id;
    const user_id = await this.utils.getUserUuidFromRemoteId(
      owner_id,
      connectionId,
    );
    let opts = {};
    if (user_id) {
      opts = { assigned_to: [user_id] };
    }
    return {
      remote_id: ticket.id,
      remote_data: ticket,
      name: ticket.properties.name,
      status: null,
      description: ticket.properties.description,
      due_date: new Date(ticket.properties.createdate),
      type: null,
      parent_ticket: null,
      completed_at: new Date(ticket.properties.hs_lastmodifieddate),
      priority: this.mapToTicketPriority(
        ticket.properties.hs_ticket_priority as any,
      ),
      ...opts,
      field_mappings: field_mappings,
    };
  }
}
