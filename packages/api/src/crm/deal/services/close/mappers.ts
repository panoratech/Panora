import { CloseDealInput, CloseDealOutput } from './types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/@lib/@utils';

export class CloseDealMapper implements IDealMapper {
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
  ): Promise<CloseDealInput> {
    const emptyPromise = new Promise<string>((resolve) => {
      return resolve('');
    });
    const promises = [];

    promises.push(
      source.company_id
        ? await this.utils.getRemoteIdFromCompanyUuid(source.company_id)
        : emptyPromise,
    );

    // promises.push(
    //   source.stage_id
    //     ? await this.utils.getStageIdFromStageUuid(source.stage_id)
    //     : emptyPromise,
    // );
    const [lead_id] = await Promise.all(promises);
    const result: CloseDealInput = {
      note: source.description,
      confidence: 0,
      value: source.amount || 0,
      value_period: 'monthly',
      custom: {},
      lead_id,
      status_id: source.stage_id,
    };

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
    source: CloseDealOutput | CloseDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput | UnifiedDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(source, customFieldMappings);
    }
    // Handling array of CloseDealOutput
    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: CloseDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = deal.custom[mapping.remote_id];
      }
    }

    const emptyPromise = new Promise<string>((resolve) => {
      return resolve('');
    });
    const promises = [];

    promises.push(
      deal.user_id
        ? await this.utils.getUserUuidFromRemoteId(deal.user_id, 'close')
        : emptyPromise,
    );
    promises.push(
      deal.lead_id
        ? await this.utils.getCompanyUuidFromRemoteId(deal.lead_id, 'close')
        : emptyPromise,
    );
    // promises.push(
    //   deal.status_id
    //     ? await this.utils.getStageUuidFromRemoteId(deal.status_id, 'close')
    //     : emptyPromise,
    // );

    const [user_id, company_id] = await Promise.all(promises);

    return {
      remote_id: deal.id,
      name: deal.note,
      description: deal.note, // Placeholder if there's no direct mapping
      amount: parseFloat(`${deal.value || 0}`),
      field_mappings,
      user_id,
      company_id,
    };
  }
}
