import { INoteMapper } from '@crm/note/types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { FreshsalesNoteInput, FreshsalesNoteOutput } from '@crm/@utils/@types';

//TODO
export class FreshsalesNoteMapper implements INoteMapper {
  desunify(source: UnifiedNoteInput): FreshsalesNoteInput {
    return;
  }

  unify(
    source: FreshsalesNoteOutput | FreshsalesNoteOutput[],
  ): UnifiedNoteOutput | UnifiedNoteOutput[] {
    // Handling single FreshsalesNoteOutput
    if (!Array.isArray(source)) {
      return this.mapSingleFreshsalesNoteToUnified(source);
    }

    // Handling array of FreshsalesNoteOutput
    return source.map((note) => this.mapSingleFreshsalesNoteToUnified(note));
  }

  private mapSingleFreshsalesNoteToUnified(
    note: FreshsalesNoteOutput,
  ): UnifiedNoteOutput {
    return;
  }
}
