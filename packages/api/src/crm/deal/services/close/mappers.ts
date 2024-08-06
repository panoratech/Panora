import { CloseDealInput, CloseDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloseDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'close', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
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
      lead_id: null,
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput | UnifiedCrmDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of CloseDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: CloseDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.custom[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (deal.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        deal.user_id,
        connectionId,
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
        connectionId,
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
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          contact_id: contact_id,
        };
      }
    }
    if (deal.status_id) {
      const stage_id = await this.utils.getStageUuidFromRemoteId(
        deal.status_id,
        connectionId,
      );
      if (stage_id) {
        opts = {
          ...opts,
          stage_id: stage_id,
        };
      }
    }
    return {
      remote_id: deal.id,
      remote_data: deal,
      name: deal.note,
      description: deal.note || '',
      amount: parseFloat(`${deal.value || 0}`),
      field_mappings,
      ...opts,
    };
  }
}
