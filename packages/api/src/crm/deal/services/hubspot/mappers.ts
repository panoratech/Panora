import { HubspotDealInput, HubspotDealOutput } from './types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'hubspot', this);
  }

  async desunify(
    source: UnifiedCrmDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotDealInput> {
    const result: HubspotDealInput = {
      dealname: source.name,
      amount: source.amount.toString(),
      pipeline: source.stage_id || null,
      closedate: null,
      dealstage: null,
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.hubspot_owner_id = owner_id;
      }
    }

    //TODO: hubspot does not seem to have stages object it takes only a string
    /*if (source.stage_id) {
      const stage_id = await this.utils.getRemo(source.user_id);
      if (owner_id) {
        result.dealstage = null;
      }
    }*/

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
    source: HubspotDealOutput | HubspotDealOutput[],
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
    deal: HubspotDealOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.properties[mapping.remote_id];
      }
    }

    let opts: any = {};
    if (deal.properties.hubspot_owner_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        deal.properties.hubspot_owner_id,
        connectionId,
      );
      if (owner_id) {
        opts = {
          ...opts,
          user_id: owner_id,
        };
      }
    }

    if (deal.properties.amount) {
      opts = {
        ...opts,
        amount: parseFloat(deal.properties.amount),
      };
    }

    if (deal.properties.dealstage) {
      const stage_id = await this.utils.getStageUuidFromStageName(
        deal.properties.dealstage,
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
      name: deal.properties.dealname,
      description: '',
      field_mappings,
      ...opts,
    };
  }
}
