import { ITicketMapper } from '@ticketing/ticket/types';
import {
  HubspotTicketInput,
  HubspotTicketOutput,
  TicketProperties,
  commonHubspotProperties,
} from './types';
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
    const properties: TicketProperties = { ...commonHubspotProperties };

    properties.subject = source.name;
    properties.hs_ticket_priority = source.priority || 'MEDIUM'; // Assuming 'MEDIUM' as a default

    // Map the custom fields
    if (customFieldMappings && source.field_mappings) {
      source.field_mappings.forEach((fieldMapping) => {
        const mapping = customFieldMappings.find((m) =>
          fieldMapping.hasOwnProperty(m.slug),
        );
        if (mapping && fieldMapping[mapping.slug]) {
          properties[mapping.remote_id] = fieldMapping[mapping.slug];
        }
      });
    }

    return {
      subject: source.name,
      hs_pipeline: 'default', // Replace 'default' with actual pipeline ID
      hubspot_owner_id: '', // TODO Replace 'default' with actual owner ID
      hs_pipeline_stage: '', // TODO Replace 'default' with actual pipeline stage
      hs_ticket_priority: properties.hs_ticket_priority,
    };
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
      name: ticket.properties.subject,
      status: ticket.properties.hs_pipeline_stage, // Map to your unified status
      description: ticket.properties.subject,
      due_date: new Date(ticket.properties.createdate),
      type: '', // Define how you determine the type
      parent_ticket: '', // Define how you determine the parent ticket
      tags: '', // Define how you map or store tags
      completed_at: new Date(ticket.properties.hs_lastmodifieddate),
      priority: ticket.properties.hs_ticket_priority,
      assigned_to: [], // Define how you determine assigned users
      field_mappings: field_mappings,
    };
  }
}
