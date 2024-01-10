import { HubspotNoteInput, HubspotNoteOutput } from '@crm/@utils/@types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/note/utils';

export class HubspotNoteMapper implements INoteMapper {
  private readonly utils = new Utils();

  async desunify(
    source: UnifiedNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotNoteInput> {
    const result: HubspotNoteInput = {
      hs_note_body: source.content,
      hs_timestamp: new Date().toISOString(), // Placeholder for timestamp
      hubspot_owner_id: '',
    };

    //TODO: owner is contact or company ?
    if (source.contact_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(
        source.contact_id,
      );
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    // Custom field mappings
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
    source: HubspotNoteOutput | HubspotNoteOutput[],
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
    note: HubspotNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: note.properties[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (note.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        note.properties.hubspot_owner_id,
        'hubspot',
      );
      if (owner_id) {
        opts = {
          contact_id: owner_id, //TODO is it really the contact id ?
        };
      }
    }

    return {
      content: note.properties.hs_note_body,
      field_mappings,
      ...opts,
    };
  }
}
