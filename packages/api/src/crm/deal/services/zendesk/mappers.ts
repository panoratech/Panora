import { ZendeskDealInput, ZendeskDealOutput } from '@crm/@utils/@types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';

export class ZendeskDealMapper implements IDealMapper {
  desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskDealInput {
    return;
  }

  unify(
    source: ZendeskDealOutput | ZendeskDealOutput[],
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
    deal: ZendeskDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedDealOutput {
    return;
  }
}
