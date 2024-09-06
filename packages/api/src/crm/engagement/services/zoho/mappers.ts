import {
  ZohoEngagementCallOutput,
  ZohoEngagementInput,
  ZohoEngagementMeetingOutput,
  ZohoEngagementOutput,
} from './types';
import {
  EngagementType,
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '@crm/engagement/types/model.unified';
import { IEngagementMapper } from '@crm/engagement/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class ZohoEngagementMapper implements IEngagementMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'engagement', 'zoho', this);
  }

  desunify(
    source: UnifiedCrmEngagementInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZohoEngagementInput {
    return;
  }

  async unify(
    source: ZohoEngagementOutput | ZohoEngagementOutput[],
    engagement_type: string,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput | UnifiedCrmEngagementOutput[]> {
    switch (engagement_type) {
      case 'CALL':
        return await this.unifyCall(
          source as ZohoEngagementCallOutput | ZohoEngagementCallOutput[],
          connectionId,
          customFieldMappings,
        );
      case 'MEETING':
        return await this.unifyMeeting(
          source as ZohoEngagementMeetingOutput | ZohoEngagementMeetingOutput[],
          connectionId,
          customFieldMappings,
        );
      default:
        break;
    }
  }

  private async unifyCall(
    source: ZohoEngagementCallOutput | ZohoEngagementCallOutput[],
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
    // Handling array of ZohoEngagementOutput
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

  private async unifyMeeting(
    source: ZohoEngagementMeetingOutput | ZohoEngagementMeetingOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ) {
    if (!Array.isArray(source)) {
      return this.mapSingleEngagementMeetingToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of ZohoEngagementOutput
    return Promise.all(
      source.map((engagement) =>
        this.mapSingleEngagementMeetingToUnified(
          engagement,
          connectionId,
          customFieldMappings,
        ),
      ),
    );
  }

  private async mapSingleEngagementCallToUnified(
    engagement: ZohoEngagementCallOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    // Assuming there is a method to map direction and type correctly
    const direction = engagement.Call_Type
      ? (engagement.Call_Type.toUpperCase() as EngagementType)
      : null;

    const contacts = [];
    if (engagement.Who_Id && engagement.Who_Id.id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.Who_Id.id,
        connectionId,
      );
      if (contact_id) {
        contacts[0] = contact_id;
      }
    }
    const opts: any = {};
    if (engagement.Owner) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        engagement.Owner.id,
        connectionId,
      );
      if (user_id) {
        opts.user_id = user_id;
      }
    }
    // Add the call duration to the call start time
    const startTime = new Date(engagement.Call_Start_Time);
    let endTime;

    if (engagement.Call_Duration) {
      const [minutes, seconds] =
        engagement.Call_Duration.split(':').map(Number);
      const callDurationInMs = (minutes * 60 + seconds) * 1000;
      endTime = new Date(startTime.getTime() + callDurationInMs);
    }

    return {
      remote_id: engagement.id,
      remote_data: engagement,
      content: engagement.Description,
      subject: engagement.Subject,
      type: 'CALL',
      start_at: startTime,
      end_time: endTime,
      contacts,
      direction,
      ...opts,
      field_mappings,
    };
  }

  private async mapSingleEngagementMeetingToUnified(
    engagement: ZohoEngagementMeetingOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmEngagementOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = engagement[mapping.remote_id];
      }
    }

    const contacts = [];
    if (engagement.Who_Id && engagement.Who_Id.id) {
      const contact_id = await this.utils.getContactUuidFromRemoteId(
        engagement.Who_Id.id,
        connectionId,
      );
      if (contact_id) {
        contacts.push(contact_id);
      }
    }

    if (engagement.Participants && engagement.Participants.length > 0) {
      for (const p of engagement.Participants) {
        const contact_id = await this.utils.getContactUuidFromRemoteId(
          p.participant,
          connectionId,
        );
        if (contact_id) {
          contacts.push(contact_id);
        }
      }
    }

    const opts: any = {};
    if (engagement.Owner) {
      const user_id = await this.utils.getUserUuidFromRemoteId(
        engagement.Owner.id,
        connectionId,
      );
      if (user_id) {
        opts.user_id = user_id;
      }
    }

    if (engagement.What_Id && engagement.What_Id.id) {
      const id = await this.utils.getCompanyUuidFromRemoteId(
        engagement.What_Id.id,
        connectionId,
      );
      if (id) {
        opts.company_id = id;
      }
    }
    return {
      remote_id: engagement.id,
      remote_data: engagement,
      content: engagement.Description,
      subject: engagement.Event_Title,
      start_at: engagement.Start_DateTime,
      end_time: engagement.End_DateTime,
      type: 'MEETING',
      contacts,
      ...opts,
      field_mappings,
    };
  }
}
