import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedNoteInput, UnifiedNoteOutput } from './model.unified';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';

export interface INoteService {
  addNote(
    noteData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalNoteOutput>>;

  syncNotes(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalNoteOutput[]>>;
}

export interface INoteMapper {
  desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalNoteOutput | OriginalNoteOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]>;
}
