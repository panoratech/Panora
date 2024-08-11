import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@crm/@lib/@utils';
import { IDealMapper } from '@crm/deal/types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { Injectable } from '@nestjs/common';
import {
  RedtailDealInput,
  RedtailDealOutput,
} from './types';

@Injectable()
export class RetailDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'retail', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<RedtailDealInput> {
    const result: RedtailDealInput = {
      name: source.name,
      value: source.amount,
      description: source.description,
      stage: source.stage || 'Prospecting', // Default stage
      projected_revenue: source.projected_revenue,
      actual_revenue: source.actual_revenue,
      deleted: source.deleted,
    };

    if (source.owner_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.owner_id);
      if (owner_id) {
        result.owner_id = { id: owner_id, name: '', email: '', has_pic: 0, pic_hash: '', active_flag: false, value: 0 };
      }
    }

    if (source.account_id) {
      result.company_id = await this.utils.getRemoteIdFromAccountUuid(source.account_id);
    }

    if (customFieldMappings && source.field_mappings) {
      for (const [slug, value] of Object.entries(source.field_mappings)) {
        const mapping = customFieldMappings.find(
          (mapping) => mapping.slug === slug,
        );
        if (mapping) {
          result[mapping.remote_id] = value;
        }
      }
    }

    return result;
  }

  async unify(
    source: RedtailDealOutput | RedtailDealOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput | UnifiedCrmDealOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleDealToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(
          deal,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: RedtailDealOutput,
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

    const opts: any = {};
    if (deal.owner_id?.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        deal.owner_id.id,
        connectionId,
      );
      if (user_id) {
        opts.owner_id = user_id;
      }
    }

    if (deal.company_id) {
      const account_id = await this.utils.getAccountUuidFromRemoteId(
        deal.company_id.toString(),
        connectionId,
      );
      if (account_id) {
        opts.account_id = account_id;
      }
    }

    return {
      remote_id: deal.id,
      remote_data: deal,
      name: deal.name,
      value: deal.value,
      field_mappings,
      ...opts,
      description: deal.description || '',
      stage: deal.stage,
      projected_revenue: deal.projected_revenue,
      actual_revenue: deal.actual_revenue,
      deleted: deal.deleted,
    };
  }
}
