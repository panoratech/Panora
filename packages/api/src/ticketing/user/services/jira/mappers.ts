import { IUserMapper } from '@ticketing/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
} from '@ticketing/user/types/model.unified';
import { JiraUserInput, JiraUserOutput } from './types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class JiraUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('ticketing', 'user', 'jira', this);
  }
  desunify(
    source: UnifiedUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): JiraUserInput {
    return;
  }

  unify(
    source: JiraUserOutput | JiraUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedUserOutput | UnifiedUserOutput[]> {
    // If the source is not an array, convert it to an array for mapping
    const sourcesArray = Array.isArray(source) ? source : [source];

    return Promise.all(
      sourcesArray.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private mapSingleUserToUnified(
    user: JiraUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedUserOutput {
    const unifiedUser: UnifiedUserOutput = {
      remote_id: user.accountId,
      remote_data: user,
      name: `${user.displayName}`,
      email_address: user.email || null,
    };

    return unifiedUser;
  }
}
