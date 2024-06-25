import { ZendeskEngagementInput, ZendeskEngagementOutput } from './types';

import {
  UnifiedEngagementInput,
  UnifiedEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { Utils } from '@crm/@lib/@utils';
import { MappersRegistry } from '@@core/utils/registry/mappings.registry';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ZendeskEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'engagement', 'zendesk', this);
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
      summary: source.content || '',
      incoming: source.direction === 'incoming', // Example mapping
    };

    if (source.start_at && source.end_time) {
      // TODO; compute a date difference instead of raw difference
      result.duration =
        source.end_time.getSeconds() - source.start_at.getSeconds();
    }

    if (source.user_id) {
      const owner_id = await this.utils.getRemoteIdFromUserUuid(source.user_id);
      if (owner_id) {
        result.user_id = Number(owner_id);
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
    source: ZendeskEngagementOutput | ZendeskEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput | UnifiedEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(source, connectionId, customFieldMappings);
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
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementCallToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ZendeskEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementCallToUnified(
          engagement,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: ZendeskEngagementOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

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
      remote_id: String(engagement.id),
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
