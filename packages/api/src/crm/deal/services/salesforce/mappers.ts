import { SalesforceDealInput, SalesforceDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SalesforceDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'salesforce', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<SalesforceDealInput> {
    const result: SalesforceDealInput = {
      Name: source.name,
      Amount: Number(source.amount),
      StageName: source.stage_id || null,
      CloseDate: null, // TODO
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.OwnerId = owner_id;
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
    source: SalesforceDealOutput | SalesforceDealOutput[],
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
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: SalesforceDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (deal.OwnerId) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        deal.OwnerId,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (deal.Amount) {
      opts = {
        ...opts,
        amount: String(deal.Amount),
      };
    }

    if (deal.StageName) {
      const stage_id = await this.utils.getStageUuidFromStageName(
        deal.StageName,
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
      remote_id: deal.Id,
      remote_data: deal,
      name: deal.Name,
      description: deal.Description || '',
      close_date: deal.CloseDate,
      field_mappings,
      ...opts,
    };
  }
}