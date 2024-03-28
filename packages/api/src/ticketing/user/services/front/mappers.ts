import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { FrontUserInput, FrontUserOutput } from './types';

export class FrontUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): FrontUserInput {
    return;
  }

  unify(
    source: FrontUserOutput | FrontUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return sourcesArray.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: FrontUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: user.custom_fields?.[mapping.remote_id],
    }));

    const unifiedUser: UnifiedUserOutput = {
      remote_id: user.id,
      name: `${user.last_name} ${user.last_name}`,
      email_address: user.email,
      field_mappings: field_mappings,
    };

    return unifiedUser;
  }
}
