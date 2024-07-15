import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { GitlabUserInput, GitlabUserOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class GitlabUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'gitlab', this);
  }
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): GitlabUserInput {
    return;
  }

  async unify(
    source: GitlabUserOutput | GitlabUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedUserOutput | UnifiedUserOutput[]> {
    const sourcesArray = Array.isArray(source) ? source : [source];
    return sourcesArray.map((user) =>
      this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
    );
  }

  private mapSingleUserToUnified(
    user: GitlabUserOutput,
    connectionId: string,
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
            value: user ? user[mapping.remote_id] : undefined,
          }))
          .filter((mapping) => mapping.value !== undefined)
      : [];

    const unifiedUser: UnifiedUserOutput = {
      remote_id: String(user.id),
      remote_data: user,
      name: user.name,
      email_address: user.email || null,
      field_mappings,
    };

    return unifiedUser;
  }
}
