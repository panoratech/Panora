import { ZohoNoteInput, ZohoNoteOutput } from './types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/note/utils';

export class ZohoNoteMapper implements INoteMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }
  async desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoNoteInput> {
    const result: ZohoNoteInput = {
      Description: source.content,
    };

    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  async unify(
    source: ZohoNoteOutput | ZohoNoteOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleNoteToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: ZohoNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: note[mapping.remote_id],
      })) || [];

    return {
      content: note.Description,
      field_mappings,
    };
  }
}
