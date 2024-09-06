import { PipedriveNoteInput, PipedriveNoteOutput } from './types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PipedriveNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'pipedrive', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveNoteInput> {
    const result: PipedriveNoteInput = {
      content: source.content,
    };

    if (source.contact_id) {
      const owner_id = await this.utils.getRemoteIdFromContactUuid(
        source.contact_id,
      );
      if (owner_id) {
        result.person_id = Number(owner_id);
      }
    }

    if (source.company_id) {
      const org_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (org_id) {
        result.org_id = Number(org_id);
      }
    }

    if (source.deal_id) {
      const deal_id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      if (deal_id) {
        result.deal_id = Number(deal_id);
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
    source: PipedriveNoteOutput | PipedriveNoteOutput[],
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

    // Handling array of HubspotNoteOutput
    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: PipedriveNoteOutput,
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

    if (note.person_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        String(note.person_id),
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }

    if (note.deal_id) {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(note.deal_id),
        connectionId,
      );
      if (deal_id) {
        opts = {
          ...opts,
          deal_id: deal_id,
        };
      }
    }

    if (note.org_id) {
      const org_id = await this.utils.getCompanyUuidFromRemoteId(
        String(note.org_id),
        connectionId,
      );
      if (org_id) {
        opts = {
          ...opts,
          company_id: org_id,
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
