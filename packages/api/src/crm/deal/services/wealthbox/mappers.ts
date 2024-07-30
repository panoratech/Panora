import { WealthBoxDealInput, WealthBoxDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WealthBoxDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'pipedrive', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<WealthBoxDealInput> {

    const result: WealthBoxDealInput = {
      name: source.name,
      description: source.description,
      target_close: null,
      probability: null,
      stage: null,
      amounts: null
    };

    const primaryAmount = source.amount;
    const primarylinked = source.user_id;

    const amountObject = primaryAmount
      ? [{
        amount: primaryAmount,
        currency: null,
        kind: null
      }]
      : [];

    const linkedObject = primarylinked
      ? [
        {
          id: parseInt(primarylinked),
          type: null,
          name: null,
        },
      ]
      : [];

    result.amounts = amountObject
    result.linked_to = linkedObject

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.manager = Number(owner_id);
      }
    }

    if (source.stage_id) {
      const stage_id = await this.utils.getStageIdFromStageUuid(
        source.stage_id,
      );
      if (stage_id) {
        result.stage = Number(stage_id);
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

    return result
  }

  async unify(
    source: WealthBoxDealOutput | WealthBoxDealOutput[],
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

    // Handling array of HubspotDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: WealthBoxDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.custom_fields[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (deal.creator) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(deal.creator),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (deal.stage) {
      const stage_id = await this.utils.getStageUuidFromRemoteId(
        String(deal.stage),
        connectionId,
      );
      if (stage_id) {
        opts = {
          ...opts,
          stage_id: stage_id,
        };
      }
    }
    
    if (deal.amounts[0].amount) {
      opts = {
        ...opts,
        amount: deal.amounts[0].amount
      }
    }

    return {
      remote_id: String(deal.id),
      remote_data: deal,
      name: deal.name,
      field_mappings,
      description: deal.description,
      ...opts,
    };
  }
}