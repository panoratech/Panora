import { IUserMapper } from '@ticketing/user/types';
import { ZendeskUserInput, ZendeskUserOutput } from './types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';

export class ZendeskUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): ZendeskUserInput {
    return;
  }

  unify(
    source: ZendeskUserOutput | ZendeskUserOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput | UnifiedUserOutput[] {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(source, customFieldMappings);
    }
    return source.map((user) =>
      this.mapSingleUserToUnified(user, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: ZendeskUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const field_mappings = customFieldMappings?.map((mapping) => ({
      [mapping.slug]: user.user_fields?.[mapping.remote_id],
    }));

    const unifiedUser: UnifiedUserOutput = {
      remote_id: user.id + "",
      name: user.name,
      email_address: user.email,
      field_mappings: field_mappings,
    };

    return unifiedUser;
  }
}
