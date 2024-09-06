import { Injectable } from '@nestjs/common';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { AttioDealInput, AttioDealOutput } from './types';

@Injectable()
export class AttioDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'attio', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<AttioDealInput> {
    const result: any = {
      values: {
        name: source.name,
      },
    };
    if (source.stage_id) {
      const stage_name = await this.utils.getStageNameFromStageUuid(
        source.stage_id,
      );
      if (stage_name) {
        result.values.stage = stage_name;
      }
    } else {
      result.values.stage = 'In Progress'; // todo
    }
    if (source.company_id) {
      const company_id = await this.utils.getRemoteIdFromCompanyUuid(
        source.company_id,
      );
      if (company_id) {
        result.values.associated_company! = {
          target_object: 'companies',
          target_record_id: company_id,
        };
      }
    }
    if (source.user_id) {
      const email = await this.utils.getEmailFromUserUuid(source.user_id);
      if (email) {
        result.values.owner! = email;
      }
    }
    if (source.amount) {
      result.values.value = source.amount;
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
    source: AttioDealOutput | AttioDealOutput[],
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
    // Handling array of AttioDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: AttioDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.values[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (deal.values.owner && deal.values.owner.length > 0) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        deal.values.owner[0].referenced_actor_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (
      deal.values.associated_company &&
      deal.values.associated_company.length > 0
    ) {
      const company_id = await this.utils.getCompanyUuidFromRemoteId(
        deal.values.associated_company[0].target_record_id,
        connectionId,
      );
      if (company_id) {
        opts = {
          ...opts,
          company_id: company_id,
        };
      }
    }

    if (deal.values.value && deal.values.value.length > 0) {
      opts = {
        ...opts,
        amount: deal.values.value[0].currency_value,
      };
    }

    if (deal.values.stage && deal.values.stage.length > 0) {
      const stage_id = await this.utils.getStageUuidFromStageName(
        deal.values.stage[0].status.title,
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
      remote_id: deal.id.record_id,
      remote_data: deal,
      name: deal.values.name.length > 0 ? deal.values.name[0].value : null,
      description: '',
      field_mappings,
      ...opts,
    };
  }
}
