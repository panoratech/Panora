import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Utils } from '@crm/@lib/@utils';
import { IOpportunityMapper } from '@crm/opportunity/types';
import {
  UnifiedOpportunityInput,
  UnifiedOpportunityOutput,
} from '@crm/opportunity/types/model.unified';
import { Injectable } from '@nestjs/common';
import { RetailOpportunityInput, RetailOpportunityOutput } from './types';

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
  ): Promise<RetailOpportunityInput> {
    const result: any = {
      name: source.title,
      description: source.description,
      amount: source.amount,
      close_date: source.close_date ? new Date(source.close_date).toISOString() : null,
    };

    if (source.owner_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.owner_id);
      if (owner_id) {
        result.owner_id = owner_id;
      }
    }
    if (source.account_id) {
      result.account_id = await this.utils.getRemoteIdFromAccountUuid(source.account_id);
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
    source: RetailOpportunityOutput | RetailOpportunityOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedOpportunityOutput | UnifiedOpportunityOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleOpportunityToUnified(
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
    opportunity: RetailOpportunityOutput,
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
    if (opportunity.owner_id) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        opportunity.owner_id,
        connectionId,
      );
      if (user_id) {
        opts = {
          ...opts,
          owner_id: user_id,
        };
      }
    }
    if (opportunity.account_id) {
      const account_id = await this.utils.getAccountUuidFromRemoteId(
        opportunity.account_id,
        connectionId,
      );
      if (account_id) {
        opts = {
          ...opts,
          account_id: account_id,
        };
      }
    }

    return {
      remote_id: opportunity.id,
      remote_data: opportunity,
      title: opportunity.name,
      description: opportunity.description,
      amount: opportunity.amount,
      close_date: opportunity.close_date,
      field_mappings,
      ...opts,
    };
  }
}
