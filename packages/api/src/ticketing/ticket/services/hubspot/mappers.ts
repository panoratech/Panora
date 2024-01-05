import { ITicketMapper } from '@ticketing/ticket/types';
import { HubspotTicketInput, HubspotTicketOutput } from './types';
import {
  UnifiedTicketInput,
  UnifiedTicketOutput,
} from '@ticketing/ticket/types/model.unified';

export class HubspotTicketMapper implements ITicketMapper {
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotTicketInput {
    const result = {
      subject: source.name,
      hs_pipeline: source.type,
      hubspot_owner_id: '', // TODO Replace 'default' with actual owner ID
      hs_pipeline_stage: source.status,
      hs_ticket_priority: source.priority || 'MEDIUM',
    };

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
    source: HubspotTicketOutput | HubspotTicketOutput[],
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
    ticket: HubspotTicketOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketOutput {
    const field_mappings = customFieldMappings.map((mapping) => ({
      [mapping.slug]: ticket.properties[mapping.remote_id],
    }));

    return {
      id: ticket.id,
      name: ticket.properties.name, //TODO
      status: ticket.properties.hs_pipeline_stage,
      description: ticket.properties.description, //TODO
      due_date: new Date(ticket.properties.createdate),
      type: ticket.properties.hs_pipeline,
      parent_ticket: '', // Define how you determine the parent ticket
      tags: '', // Define how you map or store tags
      completed_at: new Date(ticket.properties.hs_lastmodifieddate),
      priority: ticket.properties.hs_ticket_priority,
      assigned_to: [ticket.properties.hubspot_owner_id], // Define how you determine assigned users
      field_mappings: field_mappings,
    };
  }
}
