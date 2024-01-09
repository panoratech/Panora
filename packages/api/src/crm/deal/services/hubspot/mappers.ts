import { HubspotDealInput, HubspotDealOutput } from '@crm/@utils/@types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';

export class HubspotDealMapper implements IDealMapper {
  desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotDealInput {
    return;
  }

  unify(
    source: HubspotDealOutput | HubspotDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDealOutput | UnifiedDealOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleDealToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotDealOutput
    return source.map((deal) =>
      this.mapSingleDealToUnified(deal, customFieldMappings),
    );
  }

  private mapSingleDealToUnified(
    deal: HubspotDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDealOutput {
    return;
  }
}
