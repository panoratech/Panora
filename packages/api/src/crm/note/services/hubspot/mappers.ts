import { HubspotNoteInput, HubspotNoteOutput } from '@crm/@utils/@types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';

export class HubspotNoteMapper implements INoteMapper {
  desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): HubspotNoteInput {
    return;
  }

  unify(
    source: HubspotNoteOutput | HubspotNoteOutput[],
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
    note: HubspotNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedNoteOutput {
    return;
  }
}
