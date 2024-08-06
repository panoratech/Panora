import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingVendorcreditInput,
  UnifiedAccountingVendorcreditOutput,
} from './model.unified';
import { OriginalVendorCreditOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IVendorCreditService {
  addVendorCredit(
    vendorcreditData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalVendorCreditOutput>>;

  syncVendorCredits(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalVendorCreditOutput[]>>;
}

export interface IVendorCreditMapper {
  desunify(
    source: UnifiedAccountingVendorcreditInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalVendorCreditOutput | OriginalVendorCreditOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingVendorcreditOutput | UnifiedAccountingVendorcreditOutput[]>;
}
