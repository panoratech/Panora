import { IUserMapper } from '@ticketing/user/types';
import { ZendeskUserInput, ZendeskUserOutput } from './types';
import {
  UnifiedTicketingUserInput,
  UnifiedTicketingUserOutput,
} from '@ticketing/user/types/model.unified';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class ZendeskUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'zendesk', this);
  }
  desunify(
    source: UnifiedTicketingUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskUserInput {
    return;
  }

  unify(
    source: ZendeskUserOutput | ZendeskUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingUserOutput | UnifiedTicketingUserOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private async mapSingleUserToUnified(
    user: ZendeskUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingUserOutput> {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user.user_fields[mapping.remote_id];
      }
    }
    const unifiedUser: UnifiedTicketingUserOutput = {
      remote_id: String(user.id),
      remote_data: user,
      name: user.name,
      email_address: user.email,
      field_mappings: field_mappings,
    };

    if (user.default_group_id) {
      unifiedUser.teams = [
        await this.utils.getTeamUuidFromRemoteId(
          String(user.default_group_id),
          connectionId,
        ),
      ];
    }

    return unifiedUser;
  }
}
