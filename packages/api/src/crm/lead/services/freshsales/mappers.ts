import { ILeadMapper } from '@crm/lead/types';
import {
  UnifiedLeadInput,
  UnifiedLeadOutput,
} from '@crm/lead/types/model.unified';
import { FreshsalesLeadInput, FreshsalesLeadOutput } from '@crm/@utils/@types';

//TODO
export class FreshsalesLeadMapper implements ILeadMapper {
  desunify(source: UnifiedLeadInput): FreshsalesLeadInput {
    return;
  }

  unify(
    source: FreshsalesLeadOutput | FreshsalesLeadOutput[],
  ): UnifiedLeadOutput | UnifiedLeadOutput[] {
    // Handling single FreshsalesLeadOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesLeadToUnified(source);
    }

    // Handling array of FreshsalesLeadOutput
    return source.map((lead) => this.mapSingleFreshsalesLeadToUnified(lead));
  }

  private mapSingleFreshsalesLeadToUnified(
    lead: FreshsalesLeadOutput,
  ): UnifiedLeadOutput {
    return;
  }
}
