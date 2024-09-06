import { ZendeskDealInput, ZendeskDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'zendesk', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskDealInput> {
    const result: ZendeskDealInput = {
      name: source.name,
      value: source.amount,
    };

    if (source.company_id) {
      result.contact_id = Number(
        await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
      );
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.owner_id = Number(owner_id);
      }
    }
    if (source.stage_id) {
      const stage_id = await this.utils.getStageIdFromStageUuid(
        source.stage_id,
      );
      if (stage_id) {
        result.stage_id = Number(stage_id);
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
    source: ZendeskDealOutput | ZendeskDealOutput[],
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
    deal: ZendeskDealOutput,
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
    if (deal.owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(deal.owner_id),
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }
    if (deal.stage_id) {
      const stage_id = await this.utils.getStageUuidFromRemoteId(
        String(deal.stage_id),
        connectionId,
      );
      if (stage_id) {
        opts = {
          ...opts,
          stage_id: stage_id,
        };
      }
    }

    if (deal.contact_id) {
      const contact_id = await this.utils.getCompanyUuidFromRemoteId(
        String(deal.contact_id),
        connectionId,
      );
      if (contact_id) {
        opts = {
          ...opts,
          company_id: contact_id,
        };
      }
    }

    return {
      remote_id: String(deal.id),
      remote_data: deal,
      name: deal.name,
      amount:
        typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value,
      field_mappings,
      description: '', //todo null
      ...opts,
    };
  }
}
