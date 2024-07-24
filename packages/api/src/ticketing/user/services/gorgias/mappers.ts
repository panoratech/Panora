import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedTicketingUserInput,
  UnifiedTicketingUserOutput,
} from '@ticketing/user/types/model.unified';
import { GorgiasUserInput, GorgiasUserOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GorgiasUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'gorgias', this);
  }
  desunify(
    source: UnifiedTicketingUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasUserInput {
    return;
  }

  async unify(
    source: GorgiasUserOutput | GorgiasUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingUserOutput | UnifiedTicketingUserOutput[]> {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return Promise.all(
      sourcesArray.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private mapSingleUserToUnified(
    user: GorgiasUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingUserOutput {
    const field_mappings = customFieldMappings
      ? customFieldMappings
          .map((mapping) => ({
            key: mapping.slug,
            value: user.meta ? user.meta[mapping.remote_id] : undefined,
          }))
          .filter((mapping) => mapping.value !== undefined)
      : [];

    const unifiedUser: UnifiedTicketingUserOutput = {
      remote_id: String(user.id),
      remote_data: user,
      name: `${user.firstname} ${user.lastname}`,
      email_address: user.email,
      field_mappings,
    };

    return unifiedUser;
  }
}
