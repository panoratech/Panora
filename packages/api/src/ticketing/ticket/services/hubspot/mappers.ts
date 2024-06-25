import { ITicketMapper } from '@ticketing/ticket/types';
import { HubspotTicketInput, HubspotTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
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
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotTicketInput {
    const result = {
      subject: source.name,
      hs_pipeline: '',
      hubspot_owner_id: '',
      hs_pipeline_stage: '',
      hs_ticket_priority: source.priority || 'MEDIUM',
    };

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

    return sourcesArray.map((ticket) =>
      this.mapSingleTicketToUnified(ticket, connectionId, customFieldMappings),
    );
  }

  private mapSingleTicketToUnified(
    ticket: HubspotTicketOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = ticket.properties[mapping.remote_id];
      }
    }

    return {
      remote_id: ticket.id,
      name: ticket.properties.name,
      status: '', // hs_pipeline_stage: '',
      description: ticket.properties.description,
      due_date: new Date(ticket.properties.createdate),
      type: '', //ticket.properties.hs_pipeline,
      parent_ticket: '', // Define how you determine the parent ticket
      completed_at: new Date(ticket.properties.hs_lastmodifieddate),
      priority: ticket.properties.hs_ticket_priority,
      assigned_to: [ticket.properties.hubspot_owner_id], // Define how you determine assigned users
      field_mappings: field_mappings,
    };
  }
}
