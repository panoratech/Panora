import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingJournalentryInput,
  UnifiedAccountingJournalentryOutput,
} from './model.unified';
import { OriginalJournalEntryOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface IJournalEntryService {
  addJournalEntry(
    journalentryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJournalEntryOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalJournalEntryOutput[]>>;
}

export interface IJournalEntryMapper {
  desunify(
    source: UnifiedAccountingJournalentryInput,
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
  ): Promise<
    UnifiedAccountingJournalentryOutput | UnifiedAccountingJournalentryOutput[]
  >;
}
