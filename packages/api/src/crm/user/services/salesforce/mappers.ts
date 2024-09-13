import { SalesforceUserInput, SalesforceUserOutput } from './types';
import {
  UnifiedCrmUserInput,
  UnifiedCrmUserOutput,
} from '@crm/user/types/model.unified';
import { IUserMapper } from '@crm/user/types';
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@crm/@lib/@utils';

@Injectable()
export class SalesforceUserMapper implements IUserMapper {
  constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
    this.mappersRegistry.registerService('crm', 'user', 'salesforce', this);
  }

  desunify(
    source: UnifiedCrmUserInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): SalesforceUserInput {
    // Salesforce doesn't typically allow creating users via API,
    // so this method might not be needed. If it is, implement the logic here.
    return {};
  }

  async unify(
    source: SalesforceUserOutput | SalesforceUserOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedCrmUserOutput | UnifiedCrmUserOutput[]> {
    if (!Array.isArray(source)) {
      return this.mapSingleUserToUnified(
        source,
        connectionId,
        customFieldMappings,
      );
    }
    // Handling array of SalesforceUserOutput
    return Promise.all(
      source.map((user) =>
        this.mapSingleUserToUnified(user, connectionId, customFieldMappings),
      ),
    );
  }

  private mapSingleUserToUnified(
    user: SalesforceUserOutput,
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): UnifiedCrmUserOutput {
    const field_mappings: { [key: string]: any } = {};
    if (customFieldMappings) {
      for (const mapping of customFieldMappings) {
        field_mappings[mapping.slug] = user[mapping.remote_id];
      }
    }

    return {
      remote_id: user.Id,
      remote_data: user,
      name: `${user.FirstName} ${user.LastName}`,
      email: user.Email,
      field_mappings,
    };
  }
}