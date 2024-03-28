import { PipedriveDealInput, PipedriveDealOutput } from './types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/deal/utils';

export class PipedriveDealMapper implements IDealMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedDealInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<PipedriveDealInput> {
    const result: PipedriveDealInput = {
      title: source.name,
      value: source.amount,
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.creator_user_id.id = Number(owner_id);
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
    source: PipedriveDealOutput | PipedriveDealOutput[],
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
    deal: PipedriveDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: deal[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (deal.creator_user_id.id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(deal.creator_user_id.id),
        'pipedrive',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }
    if (deal.stage_id) {
      const stage_id = await this.utils.getStageUuidFromRemoteId(
        String(deal.stage_id),
        'pipedrive',
      );
      if (stage_id) {
        opts = {
          stage_id: stage_id,
        };
      }
    }

    return {
      name: deal.title,
      amount: deal.value,
      description: '',
      field_mappings,
      ...opts,
    };
  }
}
