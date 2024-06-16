import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedVendorcreditInput, UnifiedVendorcreditOutput } from './model.unified';
import { OriginalVendorcreditOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IVendorcreditService {
  addVendorcredit(
    vendorcreditData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalVendorcreditOutput>>;

  syncVendorcredits(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalVendorcreditOutput[]>>;
}

export interface IVendorcreditMapper {
  desunify(
    source: UnifiedVendorcreditInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalVendorcreditOutput | OriginalVendorcreditOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedVendorcreditOutput | UnifiedVendorcreditOutput[];
}
