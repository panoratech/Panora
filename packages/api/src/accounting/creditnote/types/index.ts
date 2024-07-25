import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingCreditnoteInput,
  UnifiedAccountingCreditnoteOutput,
} from './model.unified';
import { OriginalCreditNoteOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface ICreditNoteService {
  addCreditNote(
    creditnoteData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalCreditNoteOutput>>;

  syncCreditNotes(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalCreditNoteOutput[]>>;
}

export interface ICreditNoteMapper {
  desunify(
    source: UnifiedAccountingCreditnoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalCreditNoteOutput | OriginalCreditNoteOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingCreditnoteOutput | UnifiedAccountingCreditnoteOutput[]>;
}
