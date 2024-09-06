import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedCrmNoteInput, UnifiedCrmNoteOutput } from './model.unified';
import { OriginalNoteOutput } from '@@core/utils/types/original/original.crm';
import { ApiResponse } from '@@core/utils/types';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface INoteService extends IBaseObjectService {
  addNote(
    noteData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalNoteOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalNoteOutput[]>>;
}

export interface INoteMapper {
  desunify(
    source: UnifiedCrmNoteInput,
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
  ): Promise<UnifiedCrmNoteOutput | UnifiedCrmNoteOutput[]>;
}
