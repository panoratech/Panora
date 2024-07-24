import { ZohoNoteInput, ZohoNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZohoNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'zoho', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZohoNoteInput> {
    const module = source.deal_id
      ? {
          api_name: 'Deals',
          id: await this.utils.getRemoteIdFromDealUuid(source.deal_id),
        }
      : source.company_id
      ? {
          api_name: 'Accounts',
          id: await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
        }
      : source.contact_id
      ? {
          api_name: 'Contacts',
          id: await this.utils.getRemoteIdFromContactUuid(source.contact_id),
        }
      : { api_name: null, id: null };

    const result: ZohoNoteInput = {
      Note_Content: source.content,
      Parent_Id: {
        module: {
          api_name: module.api_name,
        },
        id: module.id,
      },
    };

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
    source: ZohoNoteOutput | ZohoNoteOutput[],
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
    note: ZohoNoteOutput,
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

    const res: UnifiedCrmNoteOutput = {
      remote_id: note.id,
      remote_data: note,
      content: note.Note_Content,
      field_mappings,
    };

    const module = note.Parent_Id;
    if (module && module.id) {
      const a = await this.utils.getDealUuidFromRemoteId(
        module.id,
        connectionId,
      );
      if (a) {
        res.deal_id = a;
      } else {
        const b = await this.utils.getCompanyUuidFromRemoteId(
          module.id,
          connectionId,
        );
        if (b) {
          res.company_id = b;
        } else {
          const c = await this.utils.getContactUuidFromRemoteId(
            module.id,
            connectionId,
          );
          if (c) {
            res.contact_id = c;
          }
        }
      }
    }

    return res;
  }
}
