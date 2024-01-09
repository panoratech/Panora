import { IDealMapper } from '@crm/deal/types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { FreshsalesDealInput, FreshsalesDealOutput } from '@crm/@utils/@types';

//TODO
export class FreshsalesDealMapper implements IDealMapper {
  desunify(source: UnifiedDealInput): FreshsalesDealInput {
    return;
  }

  unify(
    source: FreshsalesDealOutput | FreshsalesDealOutput[],
  ): UnifiedDealOutput | UnifiedDealOutput[] {
    // Handling single FreshsalesDealOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesDealToUnified(source);
    }

    // Handling array of FreshsalesDealOutput
    return source.map((deal) => this.mapSingleFreshsalesDealToUnified(deal));
  }

  private mapSingleFreshsalesDealToUnified(
    deal: FreshsalesDealOutput,
  ): UnifiedDealOutput {
    return;
  }
}
