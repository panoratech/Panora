import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { GitlabUserInput, GitlabUserOutput } from './types';

export class GitlabUserMapper implements IUserMapper {
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GitlabUserInput {
    const result: GitlabUserInput = {
      name: `${source.name}`,
      email: `${source.email_address}`,
      organization: `${source.account_id}`,
    };
    return result;
  }

  unify(
    source: GitlabUserOutput | GitlabUserOutput[],
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
    user: GitlabUserOutput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const field_mappings: { [key: string]: any } = {};
    const unifiedUser: UnifiedUserOutput = {
      remote_id: `${user.id}`,
      name: `${user.name}`,
      email_address: `${user.email}`,
      field_mappings: field_mappings,
    };

    return unifiedUser;
  }
}
