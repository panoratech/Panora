import { ZendeskDealInput, ZendeskDealOutput } from '@crm/@utils/@types';
import {
  UnifiedDealInput,
  UnifiedDealOutput,
} from '@crm/deal/types/model.unified';
import { IDealMapper } from '@crm/deal/types';
import { Utils } from '@crm/deal/utils';

export class ZendeskDealMapper implements IDealMapper {
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
  ): Promise<ZendeskDealInput> {
    const result: ZendeskDealInput = {
      name: source.name,
      value: source.amount,
      contact_id: Number(
        await this.utils.getRemoteIdFromCompanyUuid(source.company_id),
      ),
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.creator_id = Number(owner_id);
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
      customFieldMappings.forEach((mapping) => {
        const customValue = source.field_mappings.find((f) => f[mapping.slug]);
        if (customValue) {
          result.custom_fields[mapping.remote_id] = customValue[mapping.slug];
        }
      });
    }

    return result;
  }

  async unify(
    source: ZendeskDealOutput | ZendeskDealOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput | UnifiedDealOutput[]> {
    if (!Array.isArray(source)) {
      return await this.mapSingleDealToUnified(source, customFieldMappings);
    }

    return Promise.all(
      source.map((deal) =>
        this.mapSingleDealToUnified(deal, customFieldMappings),
      ),
    );
  }

  private async mapSingleDealToUnified(
    deal: ZendeskDealOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedDealOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: deal.custom_fields[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (deal.creator_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(deal.creator_id),
        'zendesk',
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
        'zendesk',
      );
      if (stage_id) {
        opts = {
          stage_id: stage_id,
        };
      }
    }

    if (deal.contact_id) {
      const contact_id = await this.utils.getCompanyUuidFromRemoteId(
        String(deal.contact_id),
        'zendesk',
      );
      if (contact_id) {
        opts = {
          company_id: contact_id,
        };
      }
    }

    return {
      name: deal.name,
      amount:
        typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value,
      field_mappings,
      description: '',
      ...opts,
    };
  }
}
