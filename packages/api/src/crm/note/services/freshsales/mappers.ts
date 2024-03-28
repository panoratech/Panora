import { INoteMapper } from '@crm/note/types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { FreshsalesNoteInput, FreshsalesNoteOutput } from './types';

//TODO
export class FreshsalesNoteMapper implements INoteMapper {
  desunify(source: UnifiedNoteInput): FreshsalesNoteInput {
    return;
  }

  async unify(
    source: FreshsalesNoteOutput | FreshsalesNoteOutput[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
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
