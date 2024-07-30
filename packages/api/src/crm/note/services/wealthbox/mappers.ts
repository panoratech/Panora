import { WealthboxNoteInput, WealthboxNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WealthboxNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'wealthbox', this);
  }

  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WealthboxNoteInput> {
    const result: WealthboxNoteInput = {
      content: source.content
    };

    if(source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if(company_id) {
        const linked = {
          id : company_id,
          type: null,
          name: null
        }
        result.linked_to =[linked]
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
    source: WealthboxNoteOutput | WealthboxNoteOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmNoteOutput | UnifiedCrmNoteOutput[]> {
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
    note: WealthboxNoteOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmNoteOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = note[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (note.creator) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        note.creator.toString(),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (note.linked_to[0].id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        note.linked_to[0].id.toString(),
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    
    return {
      remote_id: note.id,
      remote_data: note,
      content: note.content,
      field_mappings,
      ...opts,
    };
  }
}