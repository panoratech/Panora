import { ZendeskNoteInput, ZendeskNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'zendesk', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskNoteInput> {
    const result: ZendeskNoteInput = {
      content: source.content,
    };
    if (source.contact_id) {
      //then the resource mut be contact and nothign else
      const contact_id = await this.utils.getRemoteIdFromContactUuid(
        source.contact_id,
      );
      if (contact_id) {
        result.resource_id = Number(contact_id);
        result.resource_type = 'contact';
      }
    } else {
      if (source.deal_id) {
        const deal_id = await this.utils.getRemoteIdFromDealUuid(
          source.deal_id,
        );
        if (deal_id) {
          result.resource_id = Number(deal_id);
          result.resource_type = 'deal';
        }
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
    source: ZendeskNoteOutput | ZendeskNoteOutput[],
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
    note: ZendeskNoteOutput,
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
    const type = note.resource_type;

    if (type == 'contact') {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        String(note.resource_id),
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }

    if (type == 'deal') {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(note.resource_id),
        connectionId,
      );
      if (deal_id) {
        opts = {
          ...opts,
          deal_id: deal_id,
        };
      }
    }

    return {
      remote_id: String(note.id),
      remote_data: note,
      content: note.content,
      field_mappings,
      ...opts,
    };
  }
}
