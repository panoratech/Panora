import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@crm/@lib/@utils';
import { INoteMapper } from '@crm/note/types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { Injectable } from '@nestjs/common';
import { HubspotNoteInput, HubspotNoteOutput } from './types';

@Injectable()
export class HubspotNoteMapper implements INoteMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'note', 'hubspot', this);
  }
  async desunify(
    source: UnifiedCrmNoteInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotNoteInput> {
    const result: any = {
      properties: {
        hs_note_body: source.content,
        hs_timestamp: new Date().toISOString(),
      },
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.properties.hubspot_owner_id = owner_id;
      }
    }
    if (source.deal_id) {
      result.associations = result.associations ? [...result.associations] : [];
      const id = await this.utils.getRemoteIdFromDealUuid(source.deal_id);
      result.associations.push({
        to: {
          id: id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 214,
          },
        ],
      });
    }
    if (source.contact_id) {
      result.associations = result.associations ? [...result.associations] : [];
      const id = await this.utils.getRemoteIdFromContactUuid(source.contact_id);
      result.associations.push({
        to: {
          id: id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 202,
          },
        ],
      });
    }
    if (source.company_id) {
      result.associations = result.associations ? [...result.associations] : [];
      const id = await this.utils.getRemoteIdFromCompanyUuid(source.company_id);
      result.associations.push({
        to: {
          id: id,
        },
        types: [
          {
            associationCategory: 'HUBSPOT_DEFINED',
            associationTypeId: 190,
          },
        ],
      });
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
    note: HubspotNoteOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmNoteOutput> {
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
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (note.associations) {
      if (note.associations.deals) {
        const remote_id = note.associations.deals.results[0].id;
        opts.deal_id = await this.utils.getDealUuidFromRemoteId(
          remote_id,
          connectionId,
        );
      }
      if (note.associations.companies) {
        const remote_id = note.associations.companies.results[0].id;
        opts.company_id = await this.utils.getCompanyUuidFromRemoteId(
          remote_id,
          connectionId,
        );
      }
      if (note.associations.contacts) {
        const remote_id = note.associations.contacts.results[0].id;
        opts.contact_id = await this.utils.getContactUuidFromRemoteId(
          remote_id,
          connectionId,
        );
      }
    }

    return {
      remote_id: note.id,
      remote_data: note,
      content: note.properties.hs_note_body,
      field_mappings,
      ...opts,
    };
  }
}
