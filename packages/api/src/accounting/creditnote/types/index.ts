import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCreditnoteInput, UnifiedCreditnoteOutput } from './model.unified';
import { OriginalCreditnoteOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICreditnoteService {
  addCreditnote(
    creditnoteData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCreditnoteOutput>>;

  syncCreditnotes(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCreditnoteOutput[]>>;
}

export interface ICreditnoteMapper {
  desunify(
    source: UnifiedCreditnoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCreditnoteOutput | OriginalCreditnoteOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCreditnoteOutput | UnifiedCreditnoteOutput[];
}
