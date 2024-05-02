import { PipedriveNoteInput, PipedriveNoteOutput } from './types';
import {
  UnifiedNoteInput,
  UnifiedNoteOutput,
} from '@crm/note/types/model.unified';
import { INoteMapper } from '@crm/note/types';
import { Utils } from '@crm/@lib/@utils';

export class PipedriveNoteMapper implements INoteMapper {
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput | UnifiedNoteOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleNoteToUnified(source, customFieldMappings);
    }

    // Handling array of HubspotNoteOutput
    return Promise.all(
      source.map((note) =>
        this.mapSingleNoteToUnified(note, customFieldMappings),
      ),
    );
  }

  private async mapSingleNoteToUnified(
    note: PipedriveNoteOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedNoteOutput> {
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
        'pipedrive',
      );
      if (contact_id) {
        opts = {
          contact_id: contact_id,
        };
      }
    }

    if (note.deal_id) {
      const deal_id = await this.utils.getDealUuidFromRemoteId(
        String(note.deal_id),
        'pipedrive',
      );
      if (deal_id) {
        opts = {
          deal_id: deal_id,
        };
      }
    }

    if (note.org_id) {
      const org_id = await this.utils.getCompanyUuidFromRemoteId(
        String(note.org_id),
        'pipedrive',
      );
      if (org_id) {
        opts = {
          company_id: org_id,
        };
      }
    }

    return {
      content: note.content,
      field_mappings,
      ...opts,
    };
  }
}
