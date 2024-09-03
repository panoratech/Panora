import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedTicketingUserInput,
  UnifiedTicketingUserOutput,
} from '@ticketing/user/types/model.unified';
import { LinearUserInput, LinearUserOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class LinearUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'linear', this);
  }
  desunify(
    source: UnifiedTicketingUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): LinearUserInput {
    return;
  }

  async unify(
    source: LinearUserOutput | LinearUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingUserOutput | UnifiedTicketingUserOutput[]> {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return sourcesArray.map((user) =>
      this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: LinearUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedTicketingUserOutput {
    // Initialize field_mappings array from customFields, if provided
    const field_mappings = customFieldMappings
      ? customFieldMappings
        .map((mapping) => ({
          key: mapping.slug,
          value: user ? user[mapping.remote_id] : undefined,
        }))
        .filter((mapping) => mapping.value !== undefined)
      : [];

    const unifiedUser: UnifiedTicketingUserOutput = {
      remote_id: user.id,
      remote_data: user,
      name: user.name,
      email_address: user.email || null,
      field_mappings,
    };

    return unifiedUser;
  }
}
