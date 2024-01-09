import { ZendeskNoteInput, ZendeskNoteOutput } from '@crm/@utils/@types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';

export class ZendeskNoteMapper implements INoteMapper {
  desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskNoteInput {
    return;
  }

  unify(
    source: ZendeskNoteOutput | ZendeskNoteOutput[],
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
    note: ZendeskNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedNoteOutput {
    return;
  }
}
