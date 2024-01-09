import { ICompanyMapper } from '@crm/company/types';
import {
  UnifiedCompanyInput,
  UnifiedCompanyOutput,
} from '@crm/company/types/model.unified';
import {
  FreshsalesCompanyInput,
  FreshsalesCompanyOutput,
} from '@crm/@utils/@types';

//TODO
export class FreshsalesCompanyMapper implements ICompanyMapper {
  desunify(source: UnifiedCompanyInput): FreshsalesCompanyInput {
    return;
  }

  unify(
    source: FreshsalesCompanyOutput | FreshsalesCompanyOutput[],
  ): UnifiedCompanyOutput | UnifiedCompanyOutput[] {
    // Handling single FreshsalesCompanyOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesCompanyToUnified(source);
    }

    // Handling array of FreshsalesCompanyOutput
    return source.map((company) =>
      this.mapSingleFreshsalesCompanyToUnified(company),
    );
  }

  private mapSingleFreshsalesCompanyToUnified(
    company: FreshsalesCompanyOutput,
  ): UnifiedCompanyOutput {
    return;
  }
}
