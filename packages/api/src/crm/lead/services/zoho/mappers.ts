import { ZohoLeadInput, ZohoLeadOutput } from '@crm/@utils/@types';
import {
  UnifiedLeadInput,
  UnifiedLeadOutput,
} from '@crm/lead/types/model.unified';
import { ILeadMapper } from '@crm/lead/types';

export class ZohoLeadMapper implements ILeadMapper {
  desunify(
    source: UnifiedLeadInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoLeadInput {
    return;
  }

  unify(
    source: ZohoLeadOutput | ZohoLeadOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedLeadOutput | UnifiedLeadOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleLeadToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotLeadOutput
    return source.map((lead) =>
      this.mapSingleLeadToUnified(lead, customFieldMappings),
    );
  }

  private mapSingleLeadToUnified(
    lead: ZohoLeadOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedLeadOutput {
    return;
  }
}
