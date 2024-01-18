import { HubspotStageInput, HubspotStageOutput } from '@crm/@utils/@types';
import {
  UnifiedStageInput,
  UnifiedStageOutput,
} from '@crm/stage/types/model.unified';
import { IStageMapper } from '@crm/stage/types';

export class HubspotStageMapper implements IStageMapper {
  desunify(
    source: UnifiedStageInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotStageInput {
    const result: HubspotStageInput = {
      // Assuming 'stage_name' maps to a specific field in HubspotStageInput
      // and custom mappings are required for the rest of the fields
      // Add direct mappings for HubspotStageInput here
      // Custom field mappings
    };

    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  unify(
    source: HubspotStageOutput | HubspotStageOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput | UnifiedStageOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleStageToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotStageOutput
    return source.map((stage) =>
      this.mapSingleStageToUnified(stage, customFieldMappings),
    );
  }

  private mapSingleStageToUnified(
    stage: HubspotStageOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedStageOutput {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: stage[mapping.remote_id],
      })) || [];

    return {
      stage_name: '', // Assuming a direct mapping or a custom field mapping is required
      field_mappings,
    };
  }
}
