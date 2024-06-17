import { HubspotDealInput, HubspotDealOutput } from './types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HubspotDealMapper implements IDealMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'deal', 'hubspot', this);
  }

  async desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<HubspotDealInput> {
    const result: HubspotDealInput = {
      dealname: source.name,
      amount: source.amount.toString(),
      pipeline: source.stage_id || '',
      closedate: '',
      dealstage: '',
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
        result.dealstage = '';
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
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput | UnifiedDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(source, customFieldMappings);
    }
    // Handling array of HubspotDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: HubspotDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput> {
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
        'hubspot',
      );
      if (owner_id) {
        opts = {
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

    return {
      remote_id: deal.id,
      name: deal.properties.dealname,
      description: deal.properties.dealname, // Placeholder if there's no direct mapping
      //TODO; stage_id: deal.properties.dealstage,
      field_mappings,
      ...opts,
    };
  }
}
