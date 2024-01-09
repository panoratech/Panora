import { PipedriveNoteInput, PipedriveNoteOutput } from '@crm/@utils/@types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';

export class PipedriveNoteMapper implements INoteMapper {
  desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): PipedriveNoteInput {
    return;
  }

  unify(
    source: PipedriveNoteOutput | PipedriveNoteOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedNoteOutput | UnifiedNoteOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleNoteToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotNoteOutput
    return source.map((note) =>
      this.mapSingleNoteToUnified(note, customFieldMappings),
    );
  }

  private mapSingleNoteToUnified(
    note: PipedriveNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedNoteOutput {
    return;
  }
}
