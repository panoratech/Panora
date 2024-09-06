import { AttioNoteInput, AttioNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AttioNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'attio', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AttioNoteInput> {
    //get the parent id of the object tied to the note
    let parent_object = '';
    let parent_record_id = '';
    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        parent_object = 'users';
        parent_record_id = owner_id;
      }
    }

    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        parent_object = 'companies';
        parent_record_id = company_id;
      }
    }

    if (source.deal_id) {
      const id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (id) {
        parent_object = 'deals';
        parent_record_id = id;
      }
    }

    if (source.contact_id) {
      const id = await this.utils.getRemoteIdFromContactUuid(source.contact_id);
      if (id) {
        parent_object = 'people';
        parent_record_id = id;
      }
    }
    const result: AttioNoteInput = {
      data: {
        title: source.content,
        content: source.content,
        format: 'plaintext',
        parent_object: parent_object,
        parent_record_id: parent_record_id,
      },
    };

    return result;
  }

  async unify(
    source: AttioNoteOutput | AttioNoteOutput[],
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
    note: AttioNoteOutput,
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
    if (note.created_by_actor.id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        note.created_by_actor.id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (note.parent_object) {
      switch (note.parent_object) {
        case 'people':
          const contact_id = await this.utils.getContactUuidFromRemoteId(
            note.parent_record_id,
            connectionId,
          );
          if (contact_id) {
            opts = {
              ...opts,
              contact_id: contact_id,
            };
          }
          break;
        case 'companies':
          const company_id = await this.utils.getCompanyUuidFromRemoteId(
            note.parent_record_id,
            connectionId,
          );
          if (company_id) {
            opts = {
              ...opts,
              company_id: company_id,
            };
          }
          break;
        case 'deals':
          const deal_id = await this.utils.getDealUuidFromRemoteId(
            note.parent_record_id,
            connectionId,
          );
          if (deal_id) {
            opts = {
              ...opts,
              deal_id: deal_id,
            };
          }
          break;
      }
    }
    return {
      remote_id: note.id.note_id,
      remote_data: note,
      content: note.content_plaintext,
      field_mappings,
      ...opts,
    };
  }
}
