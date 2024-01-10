import { HubspotDealInput, HubspotDealOutput } from '@crm/@utils/@types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/deal/utils';

export class HubspotDealMapper implements IDealMapper {
  private readonly utils = new Utils();

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
      hubspot_owner_id: '',
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

    // Custom field mappings
    if (customFieldMappings && source.field_mappings) {
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result[mapping.remote_id] = customValue[mapping.slug];
        }
      });
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
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: deal.properties[mapping.remote_id],
      })) || [];

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

    return {
      name: deal.properties.dealname,
      description: '', // Placeholder if there's no direct mapping
      amount: parseFloat(deal.properties.amount),
      //TODO; stage_id: deal.properties.dealstage,
      field_mappings,
      ...opts,
    };
  }
}
