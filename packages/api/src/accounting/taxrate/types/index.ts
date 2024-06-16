import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTaxrateInput, UnifiedTaxrateOutput } from './model.unified';
import { OriginalTaxrateOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ITaxrateService {
  addTaxrate(
    taxrateData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTaxrateOutput>>;

  syncTaxrates(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalTaxrateOutput[]>>;
}

export interface ITaxrateMapper {
  desunify(
    source: UnifiedTaxrateInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTaxrateOutput | OriginalTaxrateOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTaxrateOutput | UnifiedTaxrateOutput[];
}
