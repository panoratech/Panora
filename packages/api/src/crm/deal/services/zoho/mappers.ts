import { ZohoDealInput, ZohoDealOutput } from '@crm/@utils/@types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';

export class ZohoDealMapper implements IDealMapper {
  desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoDealInput {
    return;
  }

  unify(
    source: ZohoDealOutput | ZohoDealOutput[],
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
    deal: ZohoDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDealOutput {
    return;
  }
}
