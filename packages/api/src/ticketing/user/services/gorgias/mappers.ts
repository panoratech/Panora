import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { GorgiasUserInput, GorgiasUserOutput } from './types';

export class GorgiasUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GorgiasUserInput {
    return;
  }

  unify(
    source: GorgiasUserOutput | GorgiasUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return sourcesArray.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: GorgiasUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    // Initialize field_mappings array from customFields, if provided
    const field_mappings = customFieldMappings
      ? customFieldMappings
          .map((mapping) => ({
            key: mapping.slug,
            value: user.meta ? user.meta[mapping.remote_id] : undefined,
          }))
          .filter((mapping) => mapping.value !== undefined)
      : [];

    const unifiedUser: UnifiedUserOutput = {
      remote_id: String(user.id),
      name: `${user.firstname} ${user.lastname}`,
      email_address: user.email,
      field_mappings,
    };

    return unifiedUser;
  }
}
