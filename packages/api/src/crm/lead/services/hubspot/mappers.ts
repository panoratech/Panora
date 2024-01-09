import { HubspotLeadInput, HubspotLeadOutput } from '@crm/@utils/@types';
import {
  UnifiedLeadInput,
  UnifiedLeadOutput,
} from '@crm/lead/types/model.unified';
import { ILeadMapper } from '@crm/lead/types';

export class HubspotLeadMapper implements ILeadMapper {
  desunify(
    source: UnifiedLeadInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotLeadInput {
    return;
  }

  unify(
    source: HubspotLeadOutput | HubspotLeadOutput[],
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
    lead: HubspotLeadOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedLeadOutput {
    return;
  }
}
