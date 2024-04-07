import { ZendeskEngagementInput, ZendeskEngagementOutput } from './types';

import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/deal/utils';

export class ZendeskEngagementMapper implements IEngagementMapper {
  private readonly utils: Utils;

  constructor() {
    this.utils = new Utils();
  }

  async desunify(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskEngagementInput> {
    const type = source.type;
    switch (type) {
      case 'CALL':
        return await this.desunifyCall(source, customFieldMappings);
      case 'MEETING':
        return;
      case 'EMAIL':
        return;
      default:
        break;
    }
    return;
  }

  private async desunifyCall(
    source: UnifiedEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<ZendeskEngagementInput> {
    const result: ZendeskEngagementInput = {
      summary: source.content,
      incoming: source.direction === 'incoming', // Example mapping
      made_at: source.start_at?.toISOString(),
      updated_at: source.end_time?.toISOString(),
    };

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.user_id = Number(owner_id);
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
    source: ZendeskEngagementOutput | ZendeskEngagementOutput[],
    engagement_type: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(source, customFieldMappings);
      case 'MEETING':
        return;
      case 'EMAIL':
        return;
      default:
        break;
    }
  }

  private async unifyCall(
    source: ZendeskEngagementOutput | ZendeskEngagementOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementCallToUnified(source, customFieldMappings);
    }
    // Handling array of ZendeskEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementCallToUnified(engagement, customFieldMappings),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: ZendeskEngagementOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings =
      customFieldMappings?.map((mapping) => ({
        [mapping.slug]: engagement[mapping.remote_id],
      })) || [];

    let opts: any = {};
    if (engagement.user_id) {
      const owner_id = await this.utils.getUserUuidFromRemoteId(
        String(engagement.user_id),
        'zendesk',
      );
      if (owner_id) {
        opts = {
          user_id: owner_id,
        };
      }
    }

    // Example mapping of 'direction' based on 'incoming' boolean value
    const direction = engagement.incoming ? 'incoming' : 'outgoing';

    return {
      content: engagement.summary,
      subject: '',
      start_at: new Date(engagement.made_at),
      end_time: new Date(engagement.updated_at),
      type: 'CALL', // Placeholder, needs appropriate mapping
      field_mappings,
      direction: direction,
      ...opts,
    };
  }
}
