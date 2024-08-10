import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@crm/@lib/@utils';
import { IOpportunityMapper } from '@crm/opportunity/types';
import {
  UnifiedOpportunityInput,
  UnifiedOpportunityOutput,
} from '@crm/opportunity/types/model.unified';
import { Injectable } from '@nestjs/common';
import {
  RedtailOpportunityInput,
  RedtailOpportunityOutput,
} from './types';

@Injectable()
export class RetailOpportunityMapper implements IOpportunityMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'opportunity', 'retail', this);
  }

  async desunify(
    source: UnifiedOpportunityInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<RedtailOpportunityInput> {
    const result: RedtailOpportunityInput = {
      title: source.title,
      description: source.description,
      amount: source.amount,
      close_date: source.close_date ? new Date(source.close_date) : undefined,
      probability: source.probability,
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
    source: RedtailOpportunityOutput | RedtailOpportunityOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOpportunityOutput | UnifiedOpportunityOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleOpportunityToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }

    return Promise.all(
      source.map((opportunity) =>
        this.mapSingleOpportunityToUnified(
          opportunity,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleOpportunityToUnified(
    opportunity: RedtailOpportunityOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOpportunityOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = opportunity[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (opportunity.owner_id?.id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        opportunity.owner_id.id,
        connectionId,
      );
      if (user_id) {
        opts.owner_id = user_id;
      }
    }

    if (opportunity.company_id) {
      const account_id = await this.utils.getAccountUuidFromRemoteId(
        opportunity.company_id.toString(),
        connectionId,
      );
      if (account_id) {
        opts.account_id = account_id;
      }
    }

    return {
      remote_id: opportunity.id,
      remote_data: opportunity,
      title: opportunity.title,
      description: opportunity.description,
      amount: opportunity.amount,
      close_date: opportunity.close_date.toISOString(),
      field_mappings,
      ...opts,
      probability: opportunity.probability,
      stage: opportunity.stage,
      projected_revenue: opportunity.projected_revenue,
      actual_revenue: opportunity.actual_revenue,
      deleted: opportunity.deleted,
    };
  }
}
