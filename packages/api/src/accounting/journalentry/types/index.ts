import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedJournalentryInput, UnifiedJournalentryOutput } from './model.unified';
import { OriginalJournalentryOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IJournalentryService {
  addJournalentry(
    journalentryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalJournalentryOutput>>;

  syncJournalentrys(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalJournalentryOutput[]>>;
}

export interface IJournalentryMapper {
  desunify(
    source: UnifiedJournalentryInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalJournalentryOutput | OriginalJournalentryOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedJournalentryOutput | UnifiedJournalentryOutput[];
}
