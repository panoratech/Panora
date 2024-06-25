import { HubspotNoteInput, HubspotNoteOutput } from './types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'hubspot', this);
  }

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
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [k, v] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === k,
        );
        if (mapping) {
          result[mapping.remote_id] = v;
        }
      }
    }

    return result;
  }

  async unify(
    source: HubspotNoteOutput | HubspotNoteOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleNoteToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: HubspotNoteOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = note.properties[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (note.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        note.properties.hubspot_owner_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    return {
      remote_id: note.id,
      content: note.properties.hs_note_body,
      field_mappings,
      ...opts,
    };
  }
}
