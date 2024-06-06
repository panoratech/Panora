import { CloseDealInput, CloseDealOutput } from './types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';

export class CloseDealMapper implements IDealMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<CloseDealInput> {
    const result: CloseDealInput = {
      note: source.description,
      confidence: 0,
      value: source.amount || 0,
      value_period: 'one_time',
      custom: {},
      lead_id: '',
    };

    if (source.company_id) {
      const lead_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (lead_id) {
        result.lead_id = lead_id;
      }
    }
    if (source.stage_id) {
      const stage_id = await this.utils.getStageIdFromStageUuid(
        source.company_id,
      );
      if (stage_id) {
        result.status_id = stage_id;
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
    source: CloseDealOutput | CloseDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput | UnifiedDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(source, customFieldMappings);
    }
    // Handling array of CloseDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: CloseDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.custom[mapping.remote_id];
      }
    }

<<<<<<< HEAD
=======

>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
    let opts: any = {};
    if (deal.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        deal.user_id,
        'close',
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (deal.lead_id) {
      const lead_id = await this.utils.getCompanyUuidFromRemoteId(
        deal.lead_id,
        'close',
      );
      if (lead_id) {
        opts = {
          ...opts,
          company_id: lead_id,
        };
      }
    }
    if (deal.contact_id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        deal.contact_id,
        'close',
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    return {
      remote_id: deal.id,
      name: deal.note,
      description: deal.note, // Placeholder if there's no direct mapping
<<<<<<< HEAD
      amount: parseFloat(`${deal.value || 0}`),
=======
      amount: parseFloat(`${deal.expected_value || 0}`),
>>>>>>> f88d7e43 (feat:Add integration with Close CRM)
      //TODO; stage_id: deal.properties.dealstage,
      field_mappings,
      ...opts,
    };
  }
}
