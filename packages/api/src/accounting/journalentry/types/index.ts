import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedJournalEntryInput,
  UnifiedJournalEntryOutput,
} from './model.unified';
import { OriginalJournalEntryOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IJournalEntryService {
  addJournalEntry(
    journalentryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJournalEntryOutput>>;

  syncJournalEntrys(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalJournalEntryOutput[]>>;
}

export interface IJournalEntryMapper {
  desunify(
    source: UnifiedJournalEntryInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalJournalEntryOutput | OriginalJournalEntryOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedJournalEntryOutput | UnifiedJournalEntryOutput[]>;
}
